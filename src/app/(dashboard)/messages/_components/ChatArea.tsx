"use client";

import { useState, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import Image from "next/image";
import MessageInput from "./MessageInput";
import { Eye, Download, FileText, MoreVertical, Flag, X, Phone, Video, PhoneOff, VideoOff, Mic, MicOff, Camera, CameraOff } from "lucide-react";
import { Conversation, Message, MessageFile, SocketMessage } from "@/types/chat";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
}

interface ChatAreaProps {
  conversation: Conversation;
  currentUser: User | null;
  socket: Socket;
  onOpenSidebar: () => void;
  onMessageSent: (conversationId: string, text: string) => void;
  messages: Message[];
  setMessages: (msgs: Message[]) => void;
}

function mapSocketToMessage(
  msg: SocketMessage,
  currentUser: User,
  conversation: Conversation
): Message {
  return {
    id: msg._id || msg.tempId || `msg-${msg.senderId}-${msg.receiverId}-${Date.now()}`,
    senderId: msg.senderId,
    receiverId: msg.receiverId,
    text: msg.messageText,
    timestamp: msg.createdAt || new Date().toISOString(),
    sender: msg.senderId === currentUser._id ? "me" : "other",
    avatar:
      msg.senderId === currentUser._id
        ? currentUser.profileImage || "/my-avatar.png"
        : conversation.avatar,
    files: msg.files,
    replyTo: msg.replyTo
      ? mapSocketToMessage(msg.replyTo, currentUser, conversation)
      : undefined,
  };
}

export default function ChatArea({
  conversation,
  currentUser,
  socket,
  onOpenSidebar,
  onMessageSent,
}: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingMessage, setReplyingMessage] = useState<Message | null>(null);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [blockStatus, setBlockStatus] = useState({ iBlocked: false, blockedMe: false });
  const [conversationOnline, setConversationOnline] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // WebRTC Calling States
  const [isCalling, setIsCalling] = useState(false);
  const [isVideoCalling, setIsVideoCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{
    from: string;
    type: 'audio' | 'video';
    callMessageId: string;
    offer?: RTCSessionDescriptionInit;
  } | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'ringing' | 'connected' | 'ended'>('idle');
  const [callMessageId, setCallMessageId] = useState<string | null>(null);
  
  // WebRTC Components
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  // WebRTC Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [callDuration, setCallDuration] = useState(0);

  // Report Modal States
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportImages, setReportImages] = useState<File[]>([]);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Refs for scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Prevent duplicate messages
  const messageIdsRef = useRef<Set<string>>(new Set());

  // Helper Functions
  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], { 
        hour: "2-digit", 
        minute: "2-digit",
        hour12: true 
      });
    } catch (error) {
      return "Just now";
    }
  };

  const isImage = (fileType: string) => fileType.startsWith("image/");

  const handleDownload = async (url: string, name: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  // Scroll Functions
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const isAtBottom = () => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    return scrollTop + clientHeight >= scrollHeight - 100;
  };

  const handleScroll = () => setShouldAutoScroll(isAtBottom());

  // ============================
  // FIXED WEBRTC FUNCTIONS
  // ============================

  // Initialize local media
  const initLocalMedia = async (isVideo: boolean = true): Promise<MediaStream | null> => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: isVideo ? {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
      }
      
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      alert("Failed to access camera/microphone. Please check permissions.");
      return null;
    }
  };

  // Create RTCPeerConnection
  const createPeerConnection = () => {
    try {
      const configuration = {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun3.l.google.com:19302" },
          { urls: "stun:stun4.l.google.com:19302" }
        ]
      };

      const pc = new RTCPeerConnection(configuration);
      peerConnectionRef.current = pc;

      // Add local stream tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          pc.addTrack(track, localStreamRef.current!);
          console.log("Added track:", track.kind);
        });
      }

      // Handle remote stream
      pc.ontrack = (event) => {
        console.log("Remote track received:", event.track.kind);
        const stream = event.streams[0];
        if (!stream) return;
        
        setRemoteStream(stream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      };

      // ICE candidate handling
      pc.onicecandidate = (event) => {
        console.log("ICE candidate:", event.candidate);
        if (event.candidate) {
          const targetId = isCalling || isVideoCalling ? conversation.id : incomingCall?.from;
          if (targetId) {
            socket.emit("webrtc-ice-candidate", {
              to: targetId,
              candidate: event.candidate
            });
          }
        }
      };

      // Connection state changes
      pc.onconnectionstatechange = () => {
        console.log("Connection state:", pc.connectionState);
        if (pc.connectionState === 'connected') {
          console.log("✅ Peer connection established!");
          setCallStatus('connected');
          stopRingtone();
        } else if (pc.connectionState === 'disconnected' || 
                   pc.connectionState === 'failed' || 
                   pc.connectionState === 'closed') {
          console.log("❌ Peer connection failed/closed");
          endCallCleanup();
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log("ICE connection state:", pc.iceConnectionState);
      };

      return pc;
    } catch (error) {
      console.error("Error creating peer connection:", error);
      return null;
    }
  };

  // Start call timer
  const startCallTimer = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    
    setCallDuration(0);
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  // Stop call timer
  const stopCallTimer = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
  };

  // Cleanup function
  const endCallCleanup = () => {
    console.log("🧹 Cleaning up call...");
    
    setCallStatus('ended');
    setIncomingCall(null);
    setIsCalling(false);
    setIsVideoCalling(false);
    setCallMessageId(null);
    stopCallTimer();
    stopRingtone();
    
    // Stop media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      localStreamRef.current = null;
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.oniceconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    setLocalStream(null);
    setRemoteStream(null);
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Reset audio/video states
    setIsAudioMuted(false);
    setIsVideoOff(false);

    // Add call ended message if call was connected
    if (currentUser && conversation && callStatus === 'connected') {
      const callType = isVideoCalling ? 'video' : 'voice';
      
      const callMessage: Message = {
        id: `call-ended-${Date.now()}`,
        senderId: currentUser._id,
        receiverId: conversation.id,
        text: `Call ended • ${callDuration}s`,
        timestamp: new Date().toISOString(),
        sender: "system",
        avatar: "/system-avatar.png",
        isCall: true,
        callType,
        callDuration
      };

      setMessages(prev => {
        if (!prev.some(m => m.id === callMessage.id)) {
          return [...prev, callMessage];
        }
        return prev;
      });
    }
  };

  // Ringtone functions
  let ringtoneAudio: HTMLAudioElement | null = null;

  const playRingtone = () => {
    try {
      if (ringtoneAudio) {
        ringtoneAudio.pause();
        ringtoneAudio.currentTime = 0;
      }
      
      ringtoneAudio = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-phone-ring-2935.mp3");
      ringtoneAudio.loop = true;
      ringtoneAudio.play().catch(e => console.log("Ringtone autoplay prevented:", e));
    } catch (error) {
      console.log("Ringtone error:", error);
    }
  };

  const stopRingtone = () => {
    if (ringtoneAudio) {
      ringtoneAudio.pause();
      ringtoneAudio.currentTime = 0;
      ringtoneAudio = null;
    }
  };

  // ============================
  // CALL INITIATION FUNCTIONS
  // ============================

  const startVoiceCall = async () => {
    if (!currentUser || !conversation.id || blockStatus.blockedMe || blockStatus.iBlocked) {
      alert("Cannot call blocked user");
      return;
    }
    
    console.log("🎤 Starting voice call to:", conversation.id);
    
    // Cleanup any existing call
    endCallCleanup();
    
    // Initialize local audio
    const stream = await initLocalMedia(false);
    if (!stream) {
      alert("Could not access microphone");
      return;
    }
    
    // Create peer connection
    const pc = createPeerConnection();
    if (!pc) {
      alert("Failed to create connection");
      return;
    }
    
    // Create offer
    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      });
      await pc.setLocalDescription(offer);
      
      // Send call request to server
      socket.emit("call-user", {
        from: currentUser._id,
        to: conversation.id,
        callType: "audio",
        offer: offer
      });

      setIsCalling(true);
      setCallStatus('calling');

      // Add call started message
      const callMessage: Message = {
        id: `call-start-${Date.now()}`,
        senderId: currentUser._id,
        receiverId: conversation.id,
        text: "Voice call started",
        timestamp: new Date().toISOString(),
        sender: "system",
        avatar: "/system-avatar.png",
        isCall: true,
        callType: "audio"
      };

      setMessages(prev => [...prev, callMessage]);
      
    } catch (error) {
      console.error("Error creating offer:", error);
      endCallCleanup();
    }
  };

  const startVideoCall = async () => {
    if (!currentUser || !conversation.id || blockStatus.blockedMe || blockStatus.iBlocked) {
      alert("Cannot call blocked user");
      return;
    }
    
    console.log("🎥 Starting video call to:", conversation.id);
    
    // Cleanup any existing call
    endCallCleanup();
    
    // Initialize local video
    const stream = await initLocalMedia(true);
    if (!stream) {
      alert("Could not access camera/microphone");
      return;
    }
    
    // Create peer connection
    const pc = createPeerConnection();
    if (!pc) {
      alert("Failed to create connection");
      return;
    }
    
    // Create offer
    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await pc.setLocalDescription(offer);
      
      // Send call request to server
      socket.emit("call-user", {
        from: currentUser._id,
        to: conversation.id,
        callType: "video",
        offer: offer
      });

      setIsVideoCalling(true);
      setCallStatus('calling');

      // Add call started message
      const callMessage: Message = {
        id: `call-start-${Date.now()}`,
        senderId: currentUser._id,
        receiverId: conversation.id,
        text: "Video call started",
        timestamp: new Date().toISOString(),
        sender: "system",
        avatar: "/system-avatar.png",
        isCall: true,
        callType: "video"
      };

      setMessages(prev => [...prev, callMessage]);
      
    } catch (error) {
      console.error("Error creating offer:", error);
      endCallCleanup();
    }
  };

  // ============================
  // CALL RESPONSE FUNCTIONS
  // ============================

  const acceptCall = async () => {
    if (!incomingCall || !currentUser) {
      console.error("No incoming call or user");
      return;
    }
    
    console.log("✅ Accepting call from:", incomingCall.from);
    
    // Initialize local media based on call type
    const isVideo = incomingCall.type === 'video';
    const stream = await initLocalMedia(isVideo);
    if (!stream) {
      console.error("Failed to get local media");
      return;
    }
    
    // Create peer connection
    const pc = createPeerConnection();
    if (!pc) {
      console.error("Failed to create peer connection");
      return;
    }
    
    // Set remote description from offer
    if (incomingCall.offer) {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
        console.log("Remote description set successfully");
        
        // Create answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        // Send answer back to caller
        socket.emit("accept-call", {
          callMessageId,
          from: currentUser._id,
          to: incomingCall.from,
          answer: answer
        });
        
        // Send ICE candidates that were gathered before answer
        setTimeout(() => {
          if (pc.iceGatheringState === "complete") {
            console.log("ICE gathering complete");
          }
        }, 1000);
        
        // Update UI
        setCallStatus('connected');
        stopRingtone();
        startCallTimer();
        
        if (isVideo) {
          setIsVideoCalling(true);
        } else {
          setIsCalling(true);
        }
        
        // Add call accepted message
        const callMessage: Message = {
          id: `call-accepted-${Date.now()}`,
          senderId: currentUser._id,
          receiverId: conversation.id,
          text: "Call accepted",
          timestamp: new Date().toISOString(),
          sender: "system",
          avatar: "/system-avatar.png",
          isCall: true,
          callType: incomingCall.type
        };
        
        setMessages(prev => [...prev, callMessage]);
        
      } catch (error) {
        console.error("Error setting remote description:", error);
        endCallCleanup();
      }
    } else {
      console.error("No offer found in incoming call");
      endCallCleanup();
    }
  };

  const rejectCall = () => {
    if (!incomingCall || !currentUser) return;
    
    console.log("❌ Rejecting call from:", incomingCall.from);
    
    socket.emit("reject-call", {
      callMessageId,
      from: currentUser._id,
      to: incomingCall.from
    });

    // Add call rejected message
    const callMessage: Message = {
      id: `call-rejected-${Date.now()}`,
      senderId: currentUser._id,
      receiverId: conversation.id,
      text: "Call rejected",
      timestamp: new Date().toISOString(),
      sender: "system",
      avatar: "/system-avatar.png",
      isCall: true,
      callType: incomingCall.type
    };

    setMessages(prev => [...prev, callMessage]);
    endCallCleanup();
  };

  const endCall = () => {
    console.log("📴 Ending call");
    
    const otherUserId = isCalling || isVideoCalling ? conversation.id : incomingCall?.from;
    
    if (otherUserId && currentUser) {
      socket.emit("end-call", {
        callMessageId: callMessageId || `call-${Date.now()}`,
        from: currentUser._id,
        to: otherUserId
      });
    }
    
    endCallCleanup();
  };

  // ============================
  // CALL CONTROLS
  // ============================

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioMuted(!isAudioMuted);
      console.log("Audio", audioTracks[0]?.enabled ? "unmuted" : "muted");
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks.forEach(track => {
          track.enabled = !track.enabled;
        });
        setIsVideoOff(!isVideoOff);
        console.log("Video", videoTracks[0]?.enabled ? "on" : "off");
      }
    }
  };

  // ============================
  // SOCKET EVENT HANDLERS - FIXED
  // ============================

  useEffect(() => {
    if (!socket || !currentUser) return;

    console.log("📡 Setting up socket listeners for WebRTC");

    // Handle incoming call with offer
    const handleIncomingCall = (data: any) => {
      console.log("📞 Incoming call received:", data);
      
      // Check if this call is for current conversation
      if (data.from === conversation.id && !isCalling && !isVideoCalling) {
        setIncomingCall({
          from: data.from,
          type: data.callType,
          callMessageId: data.callMessageId,
          offer: data.offer
        });
        setCallMessageId(data.callMessageId);
        setCallStatus('ringing');
        
        playRingtone();

        // Add incoming call message
        const callType = data.callType === 'video' ? 'Video' : 'Voice';
        const callMessage: Message = {
          id: `incoming-call-${Date.now()}`,
          senderId: data.from,
          receiverId: currentUser._id,
          text: `Incoming ${callType.toLowerCase()} call`,
          timestamp: new Date().toISOString(),
          sender: "system",
          avatar: "/system-avatar.png",
          isCall: true,
          callType: data.callType
        };

        setMessages(prev => [...prev, callMessage]);
      }
    };

    // Handle call accepted with answer
    const handleCallAccepted = async (data: any) => {
      console.log("✅ Call accepted by receiver:", data);
      
      // Check if we're the caller and this is our call
      if (data.by === conversation.id && (isCalling || isVideoCalling)) {
        try {
          const pc = peerConnectionRef.current;
          if (pc && data.answer) {
            await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
            console.log("Remote answer set successfully");
            setCallStatus('connected');
            stopRingtone();
            startCallTimer();
          }
        } catch (error) {
          console.error("Error setting remote answer:", error);
        }
      }
    };

    // Handle call rejected
    const handleCallRejected = (data: any) => {
      console.log("❌ Call rejected:", data);
      if (data.by === conversation.id && (isCalling || isVideoCalling)) {
        alert("Call was rejected");
        endCallCleanup();
      }
    };

    // Handle call ended
    const handleCallEnded = (data: any) => {
      console.log("📴 Call ended:", data);
      if (data.by === conversation.id || (incomingCall?.from === conversation.id)) {
        alert("Call ended by other user");
        endCallCleanup();
      }
    };

    // WebRTC Signaling - For when we're the callee
    const handleWebRTCOffer = async (data: any) => {
      console.log("📡 Received WebRTC offer directly:", data);
      // This is handled in handleIncomingCall already
    };

    const handleWebRTCAnswer = async (data: any) => {
      console.log("📡 Received WebRTC answer as caller:", data);
      
      if (data.from === conversation.id && peerConnectionRef.current) {
        try {
          const pc = peerConnectionRef.current;
          if (pc.signalingState !== "closed") {
            await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
            console.log("Answer processed successfully");
          }
        } catch (error) {
          console.error("Error processing answer:", error);
        }
      }
    };

    const handleWebRTCICECandidate = async (data: any) => {
      console.log("📡 Received ICE candidate:", data);
      
      if (data.from === conversation.id && peerConnectionRef.current) {
        try {
          const pc = peerConnectionRef.current;
          if (pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            console.log("ICE candidate added");
          }
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      }
    };

    // Listen for events
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("call-rejected", handleCallRejected);
    socket.on("call-ended", handleCallEnded);
    socket.on("webrtc-offer", handleWebRTCOffer);
    socket.on("webrtc-answer", handleWebRTCAnswer);
    socket.on("webrtc-ice-candidate", handleWebRTCICECandidate);

    return () => {
      console.log("🧹 Cleaning up socket listeners");
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccepted);
      socket.off("call-rejected", handleCallRejected);
      socket.off("call-ended", handleCallEnded);
      socket.off("webrtc-offer", handleWebRTCOffer);
      socket.off("webrtc-answer", handleWebRTCAnswer);
      socket.off("webrtc-ice-candidate", handleWebRTCICECandidate);
    };
  }, [socket, currentUser, conversation, incomingCall, isCalling, isVideoCalling]);

  // ============================
  // MESSAGE HANDLING (NO DUPLICATES)
  // ============================

  useEffect(() => {
    if (!socket || !currentUser || !conversation) return;

    // Handle sent message
    const handleSentMessage = (msg: SocketMessage) => {
      console.log("📤 Sent message received:", msg);
      
      // Don't process if not for this conversation
      if (msg.receiverId !== conversation.id && msg.senderId !== conversation.id) return;

      setMessages(prev => {
        // Check if message already exists
        const exists = prev.some(m => m.id === msg._id || m.id === msg.tempId);
        if (exists) return prev;

        // Replace temp message
        if (msg.tempId) {
          return prev.map(m => m.id === msg.tempId ? mapSocketToMessage(msg, currentUser, conversation) : m);
        }

        // Add new message
        return [...prev, mapSocketToMessage(msg, currentUser, conversation)];
      });
    };

    // Handle incoming message
    const handleIncomingMessage = (msg: SocketMessage) => {
      console.log("📥 Incoming message:", msg);
      
      // Don't process own messages
      if (msg.senderId === currentUser._id) return;
      
      // Check if message is for this conversation
      const isRelevant = (msg.senderId === conversation.id && msg.receiverId === currentUser._id) ||
                         (msg.receiverId === conversation.id && msg.senderId === currentUser._id);
      if (!isRelevant) return;

      setMessages(prev => {
        // Check if message already exists
        if (prev.some(m => m.id === msg._id)) {
          return prev;
        }
        return [...prev, mapSocketToMessage(msg, currentUser, conversation)];
      });

      setShouldAutoScroll(true);
    };

    // Other socket listeners
    const handleUserBlocked = (data: any) => {
      if (data.blockedBy === conversation.id) {
        setBlockStatus(prev => ({ ...prev, blockedMe: true }));
        alert("This user has blocked you.");
      }
    };

    const handleUserUnblocked = (data: any) => {
      if (data.unblockedBy === conversation.id) {
        setBlockStatus(prev => ({ ...prev, blockedMe: false }));
        alert("You are unblocked by this user.");
      }
    };

    const handleUserOnline = (userId: string) => {
      if (userId === conversation.id) setConversationOnline(true);
    };

    const handleUserOffline = (userId: string) => {
      if (userId === conversation.id) setConversationOnline(false);
    };

    socket.on("msg-sent", handleSentMessage);
    socket.on("msg-receive", handleIncomingMessage);
    socket.on("user-blocked", handleUserBlocked);
    socket.on("user-unblocked", handleUserUnblocked);
    socket.on("user-online", handleUserOnline);
    socket.on("user-offline", handleUserOffline);

    return () => {
      socket.off("msg-sent", handleSentMessage);
      socket.off("msg-receive", handleIncomingMessage);
      socket.off("user-blocked", handleUserBlocked);
      socket.off("user-unblocked", handleUserUnblocked);
      socket.off("user-online", handleUserOnline);
      socket.off("user-offline", handleUserOffline);
    };
  }, [socket, currentUser, conversation]);

  // ============================
  // OTHER USE EFFECTS
  // ============================

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".message-bubble")) {
        setActiveMessageId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (shouldAutoScroll) scrollToBottom();
  }, [messages, shouldAutoScroll]);

  useEffect(() => {
    if (conversation) {
      setShouldAutoScroll(true);
      setTimeout(() => scrollToBottom("instant"), 100);
    }
  }, [conversation.id]);

  // Fetch messages
  useEffect(() => {
    if (!currentUser || !conversation) return;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(
          `https://matrimonial-backend-7ahc.onrender.com/api/message?currentUserId=${conversation.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (!res.ok) throw new Error("Failed to fetch messages");

        const data = await res.json();
        
        // Reset message IDs
        messageIdsRef.current.clear();
        
        const loadedMessages: Message[] = [];
        
        data.data.forEach((msg: SocketMessage) => {
          const message = mapSocketToMessage(msg, currentUser, conversation);
          // Prevent duplicates
          if (!messageIdsRef.current.has(message.id)) {
            messageIdsRef.current.add(message.id);
            loadedMessages.push(message);
          }
        });

        setMessages(loadedMessages);
        setIsLoading(false);
        setShouldAutoScroll(true);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [conversation.id, currentUser]);

  // Fetch block status
  useEffect(() => {
    if (!conversation) return;
    const fetchBlockStatus = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(
          `https://matrimonial-backend-7ahc.onrender.com/api/message/isBlocked/${conversation.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.success) {
          setBlockStatus({
            iBlocked: data.data.iBlocked,
            blockedMe: data.data.blockedMe,
          });
        }
      } catch (err) {
        console.error("Failed to fetch block status:", err);
      }
    };
    fetchBlockStatus();
  }, [conversation]);

  // Fetch online status
  useEffect(() => {
    const fetchOnlineStatus = async () => {
      if (!conversation.id) return;
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(
          `https://matrimonial-backend-7ahc.onrender.com/api/message/online`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        const onlineUsers: string[] = data.data || [];
        setConversationOnline(onlineUsers.includes(conversation.id));
      } catch (err) {
        console.error("Failed to fetch online status:", err);
        setConversationOnline(false);
      }
    };
    fetchOnlineStatus();
  }, [conversation.id]);

  // ============================
  // MESSAGE SENDING (NO DUPLICATES)
  // ============================

  const onSendMessage = async (text: string, files?: File[]) => {
    if (!currentUser || !conversation.id) return;
    if (!text.trim() && (!files || files.length === 0)) return;

    const token = localStorage.getItem("authToken");
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const localFiles = files?.length
      ? files.map((file) => ({
          fileName: file.name,
          fileUrl: URL.createObjectURL(file),
          fileType: file.type,
          fileSize: file.size,
        }))
      : [];

    // Add optimistic message (ONCE)
    if (text.trim() || localFiles.length > 0) {
      const optimisticMessage: Message = {
        id: tempId,
        senderId: currentUser._id,
        receiverId: conversation.id,
        text,
        timestamp: new Date().toISOString(),
        sender: "me",
        avatar: currentUser.profileImage,
        files: localFiles,
        isOptimistic: true
      };

      setMessages(prev => {
        // Check if already added
        if (prev.some(m => m.id === tempId)) return prev;
        return [...prev, optimisticMessage];
      });

      scrollToBottom();
    }

    try {
      // FILE MESSAGE
      if (files && files.length > 0) {
        const formData = new FormData();
        formData.append("receiverId", conversation.id);
        formData.append("messageText", text || "");

        if (replyingMessage?.id) {
          formData.append("replyToId", replyingMessage.id);
        }

        files.forEach((file) => {
          formData.append("file", file);
        });

        // Send to API
        const res = await fetch(
          "https://matrimonial-backend-7ahc.onrender.com/api/message/send-file",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        const data = await res.json();

        if (data.success) {
          // Replace optimistic message with real one
          setMessages(prev =>
            prev.map(m =>
              m.id === tempId
                ? mapSocketToMessage(data.data, currentUser, conversation)
                : m
            )
          );
        }
        return;
      }

      // TEXT MESSAGE
      const res = await fetch(
        "https://matrimonial-backend-7ahc.onrender.com/api/message",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            receiverId: conversation.id,
            messageText: text,
            replyToId: replyingMessage?.id || null,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        // Replace optimistic message
        setMessages(prev =>
          prev.map(m =>
            m.id === tempId
              ? mapSocketToMessage(data.data, currentUser, conversation)
              : m
          )
        );
      }
    } catch (err) {
      console.error("Send message error:", err);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setReplyingMessage(null);
    }
  };

  // ============================
  // OTHER HANDLERS
  // ============================

  const handleBlockUser = async () => {
    if (!conversation.id) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `https://matrimonial-backend-7ahc.onrender.com/api/message/block`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ otherUserId: conversation.id }),
        }
      );
      if (!res.ok) throw new Error("Failed to block user");
      setBlockStatus({ ...blockStatus, iBlocked: true });
      alert("User blocked");
      setHeaderMenuOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleUnblockUser = async () => {
    if (!conversation.id) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `https://matrimonial-backend-7ahc.onrender.com/api/message/unblock`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ otherUserId: conversation.id }),
        }
      );
      if (!res.ok) throw new Error("Failed to unblock user");
      setBlockStatus({ ...blockStatus, iBlocked: false });
      alert("User unblocked");
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteAllChat = async () => {
    if (!conversation.id) return;
    if (!confirm("Delete all chat messages?")) return;

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `https://matrimonial-backend-7ahc.onrender.com/api/message/delete/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ otherUserId: conversation.id }),
        }
      );
      if (!res.ok) throw new Error("Failed to delete all messages");

      setMessages([]);
      alert("All messages deleted successfully");
      setHeaderMenuOpen(false);

      socket.emit("delete-chat", {
        from: currentUser?._id,
        to: conversation.id,
      });
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (msgId: string) => {
    if (msgId.startsWith("temp-"))
      return setMessages((prev) => prev.filter((m) => m.id !== msgId));

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `https://matrimonial-backend-7ahc.onrender.com/api/message/delete/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ messageId: msgId }),
        }
      );
      if (!res.ok) throw new Error("Failed to delete message");
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
      setActiveMessageId(null);
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleReply = (msg: Message) => {
    setReplyingMessage(msg);
    setActiveMessageId(null);
  };

  const handleSubmitReport = async () => {
    if (!reportTitle.trim() || !reportDescription.trim()) {
      alert("Please fill all required fields");
      return;
    }

    setIsSubmittingReport(true);
    setReportSuccess(false);

    try {
      const token = localStorage.getItem("authToken");
      const reporterId = currentUser?._id;
      const reportedUserId = conversation.id;

      if (!reporterId) {
        alert("Please login to submit report");
        return;
      }

      const formData = new FormData();
      formData.append("reporter", reporterId);
      formData.append("reportedUser", reportedUserId);
      formData.append("title", reportTitle);
      formData.append("description", reportDescription);

      reportImages.forEach((img, index) => {
        formData.append("image", img);
      });

      const res = await fetch(
        "https://matrimonial-backend-7ahc.onrender.com/api/report/create",
        {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();
      console.log("Report API Response:", data);

      if (data.success) {
        setReportSuccess(true);
        setTimeout(() => {
          setIsReportOpen(false);
          setReportTitle("");
          setReportDescription("");
          setReportImages([]);
          setReportSuccess(false);
        }, 2000);
      } else {
        alert(data.message || "Failed to submit report");
      }
    } catch (err) {
      console.error("Report submission error:", err);
      alert("An error occurred while submitting the report");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // ============================
  // RENDER
  // ============================

  return (
    <div className="flex flex-col h-full relative">
      {/* Header - Fully Responsive */}
      <div className="bg-white border-b border-gray-200 p-3 md:p-4 shadow-sm flex items-center justify-between relative max-md:fixed max-md:top-0 max-md:left-0 max-md:right-0 max-md:z-40 max-md:h-16">
        <div className="flex items-center space-x-2 md:space-x-3">
          <button 
            onClick={onOpenSidebar} 
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="relative">
              {conversation.avatar ? (
                <Image
                  src={conversation.avatar}
                  alt={conversation.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm md:text-base">
                  {conversation.name?.charAt(0).toUpperCase()}
                </div>
              )}
              {conversationOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            <div className="max-w-[150px] md:max-w-none">
              <h2 className="font-semibold text-sm md:text-base truncate">{conversation.name}</h2>
              <p className={`text-xs md:text-sm ${conversationOnline ? "text-green-600" : "text-gray-500"}`}>
                {conversationOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 md:space-x-2">
          {/* Voice Call Button */}
          <button
            onClick={startVoiceCall}
            disabled={blockStatus.blockedMe || blockStatus.iBlocked || !conversationOnline}
            className={`p-1.5 md:p-2 rounded-full transition-colors ${blockStatus.blockedMe || blockStatus.iBlocked || !conversationOnline
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
            title="Voice Call"
          >
            <Phone size={18} className="md:w-5 md:h-5" />
          </button>

          {/* Video Call Button */}
          <button
            onClick={startVideoCall}
            disabled={blockStatus.blockedMe || blockStatus.iBlocked || !conversationOnline}
            className={`p-1.5 md:p-2 rounded-full transition-colors ${blockStatus.blockedMe || blockStatus.iBlocked || !conversationOnline
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
            title="Video Call"
          >
            <Video size={18} className="md:w-5 md:h-5" />
          </button>

          {/* More Options Button */}
          <div className="relative">
            <button
              onClick={() => setHeaderMenuOpen((prev) => !prev)}
              className="p-1.5 md:p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <MoreVertical size={18} className="md:w-5 md:h-5" />
            </button>

            {headerMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-xl border z-50 overflow-hidden">
                <button
                  onClick={() => {
                    setIsReportOpen(true);
                    setHeaderMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                >
                  <Flag size={16} className="mr-2" />
                  Report User
                </button>

                {!blockStatus.iBlocked ? (
                  <button
                    onClick={handleBlockUser}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Block User
                  </button>
                ) : (
                  <button
                    onClick={handleUnblockUser}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-yellow-700"
                  >
                    Unblock
                  </button>
                )}

                <button
                  onClick={handleDeleteAllChat}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-500"
                >
                  Delete Chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Incoming Call Modal - Responsive */}
      {incomingCall && callStatus === 'ringing' && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 text-center animate-pulse-slow">
            <div className="mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                {incomingCall.type === 'video' ? (
                  <Video size={48} className="text-blue-600" />
                ) : (
                  <Phone size={48} className="text-blue-600" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Incoming {incomingCall.type === 'video' ? 'Video' : 'Voice'} Call
              </h3>
              <p className="text-gray-600 text-lg">{conversation.name} is calling...</p>
              <p className="text-sm text-gray-500 mt-2">Ring... Ring...</p>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={rejectCall}
                className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full hover:from-red-600 hover:to-red-700 flex items-center shadow-lg transform hover:scale-105 transition-all"
              >
                <PhoneOff size={20} className="mr-2" />
                Decline
              </button>
              <button
                onClick={acceptCall}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full hover:from-green-600 hover:to-green-700 flex items-center shadow-lg transform hover:scale-105 transition-all"
              >
                <Phone size={20} className="mr-2" />
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Call Modal - Fully Responsive */}
      {(isCalling || isVideoCalling || callStatus === 'connected') && (
        <div className="absolute inset-0 bg-black flex flex-col z-50">
          {/* Video Area */}
          <div className="flex-1 relative bg-black">
            {/* Remote Video */}
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-900/30 to-blue-700/30 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-blue-500/30">
                    {isVideoCalling ? (
                      <Video size={64} className="text-blue-400" />
                    ) : (
                      <Phone size={64} className="text-blue-400" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{conversation.name}</h3>
                  <p className="text-blue-300">
                    {callStatus === 'calling' ? 'Calling...' : `Connected • ${callDuration}s`}
                  </p>
                </div>
              </div>
            )}
            
            {/* Local Video (Picture-in-Picture) */}
            {localStream && isVideoCalling && (
              <div className="absolute bottom-24 right-4 w-32 h-48 md:w-40 md:h-56 rounded-xl overflow-hidden border-4 border-white/80 shadow-2xl">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Call Info */}
            <div className="absolute top-4 left-4 bg-black/60 text-white p-4 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${callStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-ping'}`}></div>
                <div>
                  <h3 className="font-bold text-lg">
                    {isVideoCalling ? 'Video Call' : 'Voice Call'} • {callStatus === 'calling' ? 'Calling...' : `Connected ${callDuration}s`}
                  </h3>
                  <p className="text-sm opacity-90">{conversation.name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Call Controls - Responsive */}
          <div className="bg-gradient-to-t from-black/90 to-black/70 py-4 md:py-6 px-4 flex justify-center space-x-4 md:space-x-8">
            {/* Audio Toggle */}
            <button
              onClick={toggleAudio}
              className={`p-3 md:p-4 rounded-full ${isAudioMuted ? 'bg-red-600' : 'bg-gray-700/80'} text-white hover:opacity-90 transform hover:scale-110 transition-all shadow-lg`}
            >
              {isAudioMuted ? <MicOff size={20} className="md:w-6 md:h-6" /> : <Mic size={20} className="md:w-6 md:h-6" />}
            </button>
            
            {/* Video Toggle (only for video calls) */}
            {isVideoCalling && (
              <button
                onClick={toggleVideo}
                className={`p-3 md:p-4 rounded-full ${isVideoOff ? 'bg-red-600' : 'bg-gray-700/80'} text-white hover:opacity-90 transform hover:scale-110 transition-all shadow-lg`}
              >
                {isVideoOff ? <CameraOff size={20} className="md:w-6 md:h-6" /> : <Camera size={20} className="md:w-6 md:h-6" />}
              </button>
            )}
            
            {/* End Call */}
            <button
              onClick={endCall}
              className="p-3 md:p-4 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transform hover:scale-110 transition-all shadow-xl"
            >
              <PhoneOff size={20} className="md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Messages Container with Mobile Padding */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-gradient-to-b from-gray-50 to-gray-100 scroll-smooth pt-16 md:pt-0"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
              <p className="text-gray-500">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm">Start a conversation with {conversation.name}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === "me";
            const isSystem = msg.sender === "system";
            
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"} ${isSystem ? "justify-center" : ""} message-bubble`}
                onClick={() => !isSystem && setActiveMessageId(msg.id === activeMessageId ? null : msg.id)}
              >
                {isSystem ? (
                  // System message (calls, etc)
                  <div className="bg-gray-800/10 text-gray-600 px-4 py-2 rounded-full text-sm max-w-xs text-center backdrop-blur-sm">
                    {msg.text}
                    {msg.callDuration && (
                      <span className="ml-1 text-xs opacity-75">• {msg.callDuration}s</span>
                    )}
                  </div>
                ) : (
                  // Regular message
                  <div
                    className={`max-w-[85%] md:max-w-xs lg:max-w-md p-3 rounded-2xl ${
                      isMe 
                        ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-br-none" 
                        : "bg-white shadow-sm border rounded-bl-none"
                    } ${replyingMessage?.id === msg.id ? "ring-2 ring-indigo-400" : ""} relative`}
                  >
                    {msg.replyTo && (
                      <div className="bg-indigo-100 text-indigo-800 p-2 rounded mb-1 border-l-4 border-indigo-500 text-xs font-medium truncate">
                        {msg.replyTo.text || "File/Media"}
                      </div>
                    )}

                    {msg.text && <p className="text-sm mb-1 break-words">{msg.text}</p>}

                    {msg.files && msg.files.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {msg.files.map((file, i) => (
                          <div key={i} className="border rounded-lg overflow-hidden relative">
                            {isImage(file.fileType) ? (
                              <img
                                src={file.fileUrl}
                                alt={file.fileName}
                                className="w-full h-auto max-h-40 object-cover cursor-pointer"
                                onClick={() => window.open(file.fileUrl, "_blank")}
                              />
                            ) : (
                              <div className="flex items-center gap-3 p-2 bg-gray-50">
                                <FileText size={20} className="text-gray-600" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{file.fileName}</p>
                                  <p className="text-xs text-gray-500">{(file.fileSize / 1024).toFixed(1)} KB</p>
                                </div>
                                <div className="flex gap-1">
                                  <button 
                                    onClick={() => window.open(file.fileUrl, "_blank")}
                                    className="p-1 hover:bg-gray-200 rounded"
                                  >
                                    <Eye size={14} />
                                  </button>
                                  <button 
                                    onClick={() => handleDownload(file.fileUrl, file.fileName)}
                                    className="p-1 hover:bg-gray-200 rounded"
                                  >
                                    <Download size={14} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <p className={`text-xs mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-500'}`}>
                      {formatTime(msg.timestamp)}
                    </p>

                    {!isSystem && activeMessageId === msg.id && (
                      <div className="absolute top-0 right-0 bg-white border shadow-lg rounded-md text-sm z-50 flex flex-col overflow-hidden transform translate-x-full">
                        <button
                          className="px-3 py-1 hover:bg-gray-100 text-black whitespace-nowrap"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReply(msg);
                          }}
                        >
                          Reply
                        </button>
                        {isMe && (
                          <button
                            className="px-3 py-1 hover:bg-gray-100 text-red-500 whitespace-nowrap"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(msg.id);
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Block / Unblock Notice - Responsive */}
      {blockStatus.blockedMe && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 px-4 py-2 text-center text-sm md:text-base">
          ⚠️ You are blocked by this user
        </div>
      )}
      {blockStatus.iBlocked && !blockStatus.blockedMe && (
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 text-yellow-700 px-4 py-2 text-center text-sm md:text-base flex flex-col md:flex-row justify-center items-center gap-2">
          <span>You have blocked this user.</span>
          <button 
            onClick={handleUnblockUser} 
            className="text-yellow-700 underline font-semibold hover:text-yellow-800"
          >
            Unblock
          </button>
        </div>
      )}

      {/* Instagram Style Reply Preview */}
      {replyingMessage && (
        <div className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 border-t border-indigo-200 flex items-center justify-between shadow-sm">
          <div className="flex flex-col max-w-[85%]">
            <span className="text-[11px] text-indigo-700 font-medium">Replying to</span>
            <span className="text-sm font-semibold text-indigo-900 truncate">
              {replyingMessage.text || "File / Media"}
            </span>
          </div>

          <button
            onClick={() => setReplyingMessage(null)}
            className="text-indigo-500 hover:text-red-500 font-bold p-1 hover:bg-indigo-100 rounded-full"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Box */}
      <MessageInput
        onSendMessage={onSendMessage}
        replyingMessage={
          replyingMessage
            ? { text: replyingMessage.text || "", id: replyingMessage.id }
            : undefined
        }
        onCancelReply={() => setReplyingMessage(null)}
        disabled={blockStatus.blockedMe || blockStatus.iBlocked || isCalling || isVideoCalling}
        socket={socket}
        currentUser={currentUser}
        to={conversation.id}
      />

      {/* REPORT POPUP MODAL */}
      {isReportOpen && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl relative">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Report User
              </h3>
              <button
                onClick={() => setIsReportOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
                disabled={isSubmittingReport}
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {reportSuccess ? (
                <div className="bg-green-50 text-green-700 p-4 rounded text-center">
                  <div className="text-lg font-semibold mb-2">✓ Report Submitted Successfully!</div>
                  <p>Your report has been received and will be reviewed by our team.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Report *
                    </label>
                    <select
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={isSubmittingReport}
                    >
                      <option value="">Select a reason</option>
                      <option value="spam">Spam</option>
                      <option value="inappropriate">Inappropriate Content</option>
                      <option value="harassment">Harassment</option>
                      <option value="fake">Fake Profile</option>
                      <option value="scam">Scam/Fraud</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      placeholder="Please provide detailed information about the issue..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={isSubmittingReport}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Attach Proof Images (Optional)
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setReportImages(Array.from(e.target.files || []))}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      disabled={isSubmittingReport}
                    />

                    {reportImages.length > 0 && (
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {reportImages.map((img, i) => (
                          <div key={i} className="relative w-16 h-16 rounded overflow-hidden border group">
                            <img
                              src={URL.createObjectURL(img)}
                              className="w-full h-full object-cover"
                              alt={`proof-${i}`}
                            />
                            <button
                              onClick={() => setReportImages(reportImages.filter((_, idx) => idx !== i))}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                              disabled={isSubmittingReport}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={() => setIsReportOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
                disabled={isSubmittingReport}
              >
                Cancel
              </button>
              {!reportSuccess && (
                <button
                  onClick={handleSubmitReport}
                  disabled={isSubmittingReport || !reportTitle.trim() || !reportDescription.trim()}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded transition disabled:opacity-50"
                >
                  {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}