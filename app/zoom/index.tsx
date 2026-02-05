import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import jwtEncode from 'jwt-encode';
import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, Share, Text, TextInput, TouchableOpacity, View } from 'react-native';


const SESSION_NAME = "";
const USER_NAME = "RNUser";

// Add your Zoom SDK credentials
const ZOOM_SDK_KEY = process.env.EXPO_PUBLIC_ZOOM_SDK_KEY || '';
const ZOOM_SDK_SECRET = process.env.EXPO_PUBLIC_ZOOM_SDK_SECRET || '';

let ZoomVideoSdkProvider: any = null;
let useZoom: any = null;
let ZoomView: any = null;
let EventType: any = null;
let isZoomAvailable = false;

// try {
//     const ZoomSDK = require('@zoom/react-native-videosdk');
//     ZoomVideoSdkProvider = ZoomSDK.ZoomVideoSdkProvider;
//     useZoom = ZoomSDK.useZoom;
//     ZoomView = ZoomSDK.ZoomView;
//     EventType = ZoomSDK.EventType;
//     isZoomAvailable = !!(ZoomVideoSdkProvider && useZoom && ZoomView);
//     console.log('Zoom SDK loaded successfully:', isZoomAvailable);
// } catch (e) {
//     console.error("Failed to load Zoom SDK:", e);
//     isZoomAvailable = false;
// }
isZoomAvailable = false;

// Function to generate JWT token
const generateZoomToken = (sessionName: string, roleType: number = 1) => {
    if (!ZOOM_SDK_KEY || !ZOOM_SDK_SECRET) {
        throw new Error('SDK Key and Secret are required');
    }

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 3600 * 2;

    const payload = {
        app_key: ZOOM_SDK_KEY,
        iat: iat,
        exp: exp,
        tpc: sessionName,
        role_type: roleType,
        user_identity: `user_${Date.now()}`,
    };

    return jwtEncode(payload, ZOOM_SDK_SECRET);
};

const ZoomCallContent = () => {
    const zoom = useZoom();
    const [isInSession, setIsInSession] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [sessionName, setSessionName] = useState(SESSION_NAME);
    const [userName, setUserName] = useState(USER_NAME);
    const [jwtToken, setJwtToken] = useState('');
    const [mySelf, setMySelf] = useState<any>(null);

    // Debug: Log zoom object structure
    useEffect(() => {
        if (zoom) {
            console.log('Zoom object keys:', Object.keys(zoom));
            console.log('Has session?', !!zoom.session);
            console.log('Has audioHelper?', !!zoom.audioHelper);
            console.log('Has videoHelper?', !!zoom.videoHelper);
        }
    }, [zoom]);

    // Generate token when component mounts or session name changes
    useEffect(() => {
        if (ZOOM_SDK_KEY && ZOOM_SDK_SECRET && sessionName) {
            try {
                const token = generateZoomToken(sessionName.trim(), 1);
                setJwtToken(token);
                console.log('Token generated for session:', sessionName);
            } catch (error) {
                console.error('Failed to generate token:', error);
            }
        }
    }, [sessionName]);

    // Get user info when session starts
    useEffect(() => {
        if (!zoom || !isInSession) return;

        const getUserInfo = async () => {
            try {
                console.log('Getting user info...');
                console.log('zoom.session exists?', !!zoom.session);
                
                if (!zoom.session) {
                    console.error('zoom.session is undefined');
                    return;
                }
                
                if (typeof zoom.session.getMySelf !== 'function') {
                    console.error('zoom.session.getMySelf is not a function');
                    console.log('zoom.session keys:', Object.keys(zoom.session));
                    return;
                }
                
                const me = await zoom.session.getMySelf();
                console.log('My user info:', me);
                setMySelf(me);
            } catch (error) {
                console.error('Error getting user info:', error);
            }
        };

        // Wait a bit for session to be ready
        setTimeout(getUserInfo, 1000);
    }, [zoom, isInSession]);

    useEffect(() => {
        return () => {
            if (isInSession && zoom && zoom.leaveSession) {
                Promise.resolve(zoom.leaveSession(false)).catch(console.error);
            }
        };
    }, [isInSession, zoom]);

    const joinSession = async () => {
        console.log('=== JOIN SESSION START ===');
        console.log('zoom exists?', !!zoom);
        console.log('zoom.joinSession exists?', !!zoom?.joinSession);
        
        if (!zoom) {
            Alert.alert("Error", "Zoom SDK not available");
            return;
        }

        if (!zoom.joinSession || typeof zoom.joinSession !== 'function') {
            console.error('zoom.joinSession is not a function');
            console.log('zoom keys:', Object.keys(zoom));
            Alert.alert("Error", "Zoom joinSession method not available");
            return;
        }

        if (!jwtToken) {
            Alert.alert("Error", "Token not generated. Please check SDK credentials.");
            return;
        }

        if (!sessionName || sessionName.trim() === '') {
            Alert.alert("Error", "Session name is required");
            return;
        }

        console.log('Attempting to join session:', {
            sessionName,
            userName,
            tokenLength: jwtToken.length
        });

        try {
            const result = await zoom.joinSession({
                sessionName: sessionName.trim(),
                token: jwtToken,
                userName: userName.trim() || 'Guest',
                audioOptions: {
                    connect: true,
                    mute: false,
                },
                videoOptions: {
                    localVideoOn: true,
                },
                sessionIdleTimeoutMins: 40,
            });
            
            console.log('Session joined successfully:', result);
            setIsInSession(true);
            setIsVideoOn(true);
            setIsMuted(false);
            
        } catch (e: any) {
            console.error('=== JOIN SESSION ERROR ===');
            console.error('Error:', e);
            console.error('Error type:', typeof e);
            console.error('Error keys:', e ? Object.keys(e) : 'null');
            console.error('Error code:', e?.code);
            console.error('Error message:', e?.message);
            console.error('Error stack:', e?.stack);
            
            let errorMessage = "Failed to join session";
            if (e?.message?.includes('token')) {
                errorMessage = "Invalid or expired JWT token";
            } else if (e?.message?.includes('session')) {
                errorMessage = "Invalid session name";
            }
            
            Alert.alert("Error", `${errorMessage}\n\n${e?.message || 'Unknown error'}`);
        }
    };

    const leaveSession = async () => {
        if (!zoom || !zoom.leaveSession) {
            console.log('Cannot leave - zoom.leaveSession not available');
            router.back();
            return;
        }
        
        try {
            await zoom.leaveSession(false);
            setIsInSession(false);
            setMySelf(null);
            setIsVideoOn(false);
            setIsMuted(false);
            router.back();
        } catch (e) {
            console.error('Leave session error:', e);
            router.back();
        }
    };

    const toggleAudio = async () => {
        console.log('=== TOGGLE AUDIO ===');
        console.log('zoom exists?', !!zoom);
        console.log('zoom.audioHelper exists?', !!zoom?.audioHelper);
        console.log('mySelf exists?', !!mySelf);
        console.log('mySelf.userId:', mySelf?.userId);
        
        if (!zoom) {
            console.error('zoom is undefined');
            return;
        }
        
        if (!zoom.audioHelper) {
            console.error('zoom.audioHelper is undefined');
            console.log('Available zoom properties:', Object.keys(zoom));
            return;
        }
        
        if (!mySelf?.userId) {
            console.error('mySelf or userId is undefined');
            return;
        }
        
        try {
            const newMutedState = !isMuted;
            console.log('Toggling audio to:', newMutedState ? 'MUTED' : 'UNMUTED');
            
            if (newMutedState) {
                console.log('Calling muteAudio with userId:', mySelf.userId);
                await zoom.audioHelper.muteAudio(mySelf.userId);
            } else {
                console.log('Calling unmuteAudio with userId:', mySelf.userId);
                await zoom.audioHelper.unmuteAudio(mySelf.userId);
            }
            
            setIsMuted(newMutedState);
            console.log('Audio toggled successfully');
        } catch (error: any) {
            console.error('=== TOGGLE AUDIO ERROR ===');
            console.error('Error:', error);
            console.error('Error message:', error?.message);
            console.error('Error code:', error?.code);
        }
    };

    const toggleVideo = async () => {
        console.log('=== TOGGLE VIDEO ===');
        console.log('zoom exists?', !!zoom);
        console.log('zoom.videoHelper exists?', !!zoom?.videoHelper);

        if (!zoom) {
            console.error('zoom is undefined');
            return;
        }
        
        if (!zoom.videoHelper) {
            console.error('zoom.videoHelper is undefined');
            console.log('Available zoom properties:', Object.keys(zoom));
            return;
        }

        try {
            const newVideoState = !isVideoOn;
            console.log('Toggling video to:', newVideoState ? 'ON' : 'OFF');
            
            if (newVideoState) {
                console.log('Calling startVideo');
                await zoom.videoHelper.startVideo();
            } else {
                console.log('Calling stopVideo');
                await zoom.videoHelper.stopVideo();
            }
            
            setIsVideoOn(newVideoState);
            console.log('Video toggled successfully');
        } catch (error: any) {
            console.error('=== TOGGLE VIDEO ERROR ===');
            console.error('Error:', error);
            console.error('Error message:', error?.message);
            console.error('Error code:', error?.code);
        }
    };

    const shareSession = async () => {
        if (!sessionName || sessionName.trim() === '') {
            Alert.alert("Error", "Please create or enter a session name first");
            return;
        }
        
        const message = `📞 Join my video call!\n\n🔑 Session ID: ${sessionName}\n\n📱 Download the app and enter this Session ID to join the meeting.`;
        
        try {
            const result = await Share.share({
                message: message,
                title: 'Join Video Call'
            });
            
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    console.log('Shared via:', result.activityType);
                } else {
                    console.log('Shared successfully');
                }
            } else if (result.action === Share.dismissedAction) {
                console.log('Share dismissed');
            }
        } catch (error: any) {
            console.error('Share error:', error);
            Alert.alert("Error", error.message);
        }
    };

    const copySessionId = () => {
        if (!sessionName || sessionName.trim() === '') {
            Alert.alert("Error", "Please create or enter a session name first");
            return;
        }
        
        // For web compatibility, fall back to alert if Clipboard not available
        try {
            const { Clipboard } = require('react-native');
            if (Clipboard) {
                Clipboard.setString(sessionName);
                Alert.alert("Copied!", `Session ID "${sessionName}" copied to clipboard`);
            } else {
                throw new Error("Clipboard module missing");
            }
        } catch (error) {
            Alert.alert("Session ID", sessionName, [
                { text: "OK", style: "default" }
            ]);
        }
    };

    if (isInSession && ZoomView) {
        return (
            <View className="flex-1 bg-gray-900">
                {/* Video view */}
                {mySelf?.userId ? (
                    <View className="flex-1">
                        <ZoomView
                            userId={mySelf.userId}
                            style={{ flex: 1, width: '100%', height: '100%' }}
                            fullScreen={true}
                            videoAspect="PanAndScan"
                        />
                        <View className="absolute top-2 left-2 bg-black/70 px-3 py-1 rounded">
                            <Text className="text-white text-xs font-semibold">
                                {mySelf.userName || 'You'}
                            </Text>
                        </View>
                        
                        {/* Session Name Display with Copy */}
                        <TouchableOpacity 
                            onPress={copySessionId}
                            className="absolute top-12 self-center bg-black/60 px-4 py-2 rounded-xl border border-white/10 flex-row items-center space-x-2"
                        >
                            <Text className="text-white text-sm font-medium">
                                Session ID: <Text className="font-bold text-blue-400">{sessionName}</Text>
                            </Text>
                            <Ionicons name="copy-outline" size={16} color="white" style={{ marginLeft: 6 }} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-white text-lg">Connecting...</Text>
                    </View>
                )}

                {/* Debug info */}
                {/* <View className="absolute top-2 right-2 bg-black/70 p-2 rounded">
                    <Text className="text-white text-xs">
                        ID: {mySelf?.userId || 'loading...'}
                    </Text>
                    <Text className="text-white text-xs">
                        Video: {isVideoOn ? 'ON' : 'OFF'}
                    </Text>
                    <Text className="text-white text-xs">
                        Audio: {isMuted ? 'MUTED' : 'UNMUTED'}
                    </Text>
                    <Text className="text-white text-xs">
                        zoom: {zoom ? '✓' : '✗'}
                    </Text>
                    <Text className="text-white text-xs">
                        session: {zoom?.session ? '✓' : '✗'}
                    </Text>
                    <Text className="text-white text-xs">
                        audioH: {zoom?.audioHelper ? '✓' : '✗'}
                    </Text>
                    <Text className="text-white text-xs">
                        videoH: {zoom?.videoHelper ? '✓' : '✗'}
                    </Text>
                </View> */}
                
                {/* Controls */}
                <View className="absolute bottom-10 left-0 right-0 flex-row justify-evenly items-center">
                    <TouchableOpacity 
                        onPress={toggleAudio}
                        className={`p-4 rounded-full ${!isMuted ? 'bg-white' : 'bg-gray-600/80'}`}
                        disabled={!zoom?.audioHelper || !mySelf?.userId}
                    >
                        <Ionicons name={!isMuted ? "mic" : "mic-off"} size={28} color={!isMuted ? "black" : "white"} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={leaveSession}
                        className="p-6 rounded-full bg-red-600"
                    >
                        <Ionicons name="call" size={32} color="white" style={{ transform: [{ rotate: '135deg' }]}} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={toggleVideo}
                        className={`p-4 rounded-full ${isVideoOn ? 'bg-white' : 'bg-gray-600/80'}`}
                        disabled={!zoom?.videoHelper}
                    >
                        <Ionicons name={isVideoOn ? "videocam" : "videocam-off"} size={28} color={isVideoOn ? "black" : "white"} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-black p-6 justify-center">
             <View className="mb-8">
                 <Text className="text-white text-3xl font-bold mb-2">Zoom Meeting</Text>
                 <Text className="text-gray-400">Join a conference call</Text>
                 
                 {!ZOOM_SDK_KEY || !ZOOM_SDK_SECRET ? (
                     <View className="bg-red-900/30 p-4 rounded-lg mt-4 border border-red-700/50">
                        <Text className="text-red-400 font-bold mb-2">⚠️ Missing Credentials</Text>
                        <Text className="text-red-300 text-sm mb-2">
                            Add to your .env file:
                        </Text>
                        <Text className="text-red-200 font-mono text-xs">
                            EXPO_PUBLIC_ZOOM_SDK_KEY=your_key{'\n'}
                            EXPO_PUBLIC_ZOOM_SDK_SECRET=your_secret
                        </Text>
                     </View>
                 ) : jwtToken ? (
                     <View className="bg-green-900/30 p-4 rounded-lg mt-4 border border-green-700/50">
                        <Text className="text-green-400 text-sm">
                            ✓ Token ready for session: {sessionName}
                        </Text>
                     </View>
                 ) : null}
             </View>

             <View className="space-y-4">
                 <View>
                     <Text className="text-gray-300 mb-2 font-medium">Session Name</Text>
                     <View className="flex-row gap-2">
                         <TextInput
                            className="flex-1 bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
                            value={sessionName}
                            onChangeText={setSessionName}
                            placeholder="Enter Session Name"
                            placeholderTextColor="#6b7280"
                         />
                         {sessionName !== "" && (
                             <TouchableOpacity 
                                onPress={copySessionId}
                                className="bg-gray-700 px-4 rounded-xl items-center justify-center border border-gray-600"
                             >
                                 <Ionicons name="copy-outline" size={20} color="white" />
                             </TouchableOpacity>
                         )}
                     </View>
                 </View>

                 <View>
                     <Text className="text-gray-300 mb-2 font-medium">Your Name</Text>
                     <TextInput
                        className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
                        value={userName}
                        onChangeText={setUserName}
                        placeholder="Enter Your Name"
                        placeholderTextColor="#6b7280"
                     />
                 </View>

                 {/* Share Session Button */}
                 {sessionName !== "" && (
                     <TouchableOpacity 
                        onPress={shareSession}
                        className="p-4 rounded-xl items-center bg-purple-600 active:bg-purple-700 flex-row justify-center"
                     >
                        <Ionicons name="share-social" size={20} color="white" style={{ marginRight: 8 }} />
                        <Text className="text-white font-bold text-lg">Share Session Invite</Text>
                     </TouchableOpacity>
                 )}

                 <TouchableOpacity 
                    onPress={joinSession}
                    className={`p-4 rounded-xl items-center mt-4 ${jwtToken ? 'bg-blue-600 active:bg-blue-700' : 'bg-gray-700'}`}
                    disabled={!jwtToken}
                 >
                     <Text className="text-white font-bold text-lg">Join Session</Text>
                 </TouchableOpacity>

                 <View className="flex-row items-center my-2">
                    <View className="flex-1 h-px bg-gray-800" />
                    <Text className="text-gray-500 mx-4">OR</Text>
                    <View className="flex-1 h-px bg-gray-800" />
                 </View>

                 <TouchableOpacity 
                    onPress={() => {
                        const newSession = `Meeting-${Math.floor(Math.random() * 10000)}`;
                        setSessionName(newSession);
                    }}
                    className="p-4 rounded-xl items-center bg-gray-800 border border-gray-700 active:bg-gray-700"
                 >
                     <Text className="text-blue-400 font-bold text-lg">Generate New Meeting ID</Text>
                 </TouchableOpacity>

                 <TouchableOpacity 
                    onPress={() => router.back()}
                    className="p-4 items-center"
                 >
                     <Text className="text-gray-400">Cancel</Text>
                 </TouchableOpacity>
             </View>
        </SafeAreaView>
    );
};



export default function ZoomScreen() {
  const isExpoGo = Constants.appOwnership === 'expo';

  if (!isZoomAvailable || isExpoGo) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center p-6">
        <View className="bg-red-900/20 p-6 rounded-2xl border border-red-800 items-center">
          <Ionicons name="warning" size={48} color="#f87171" className="mb-4" />
          <Text className="text-white text-xl font-bold mb-2 text-center">
            {isExpoGo ? "Expo Go Detected" : "Zoom SDK Not Available"}
          </Text>
          <Text className="text-gray-300 text-center mb-6">
            {isExpoGo 
              ? "The Zoom Video SDK does not work in Expo Go because it uses native code." 
              : "The Zoom Video SDK is not properly installed or linked."}
          </Text>
          <Text className="text-gray-400 text-center mb-6 text-sm">
            {isExpoGo 
              ? "Please create a Development Build using: npx expo run:ios" 
              : "Please rebuild your Development Client: npx expo run:ios"}
          </Text>
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mt-8 bg-gray-700 py-3 px-6 rounded-xl"
          >
            <Text className="text-white font-bold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ... rest of code


  return (
    <ZoomVideoSdkProvider 
        config={{
            appGroupId: '', 
            domain: 'zoom.us', 
            enableLog: true,
        }}
    >
      <ZoomCallContent />
    </ZoomVideoSdkProvider>
  );
}