import React, { useContext } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppContext } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function IncomingCallOverlay() {
    const context = useContext(AppContext);
    const navigation = useNavigation();

    if (!context) return null;
const {
  incomingCall,
  acceptCall,
  declineCall,
  userDetails,
  sendQuickReply,
  savedVisitors
} = context;
    if (!incomingCall) return null;

    const handleAccept = () => {
        acceptCall();
        navigation.navigate('Call');
    };

    const visitorId = incomingCall?.visitorId;

const displayName =
  incomingCall?.visitor_name ||
  savedVisitors?.[visitorId] ||
  "Visitor";

    return (
        <Modal transparent visible={!!incomingCall} animationType="slide">
            <View style={styles.modalOverlayDark}>
                <View style={styles.incomingCallCard}>
                    {incomingCall.image ? (
                        <View style={styles.visitorThumbnailContainer}>
                            <Image
                                source={{ uri: incomingCall.image }}
                                style={styles.visitorThumbnail}
                            />
                            <View style={styles.liveBadge}>
                                <View style={styles.liveDot} />
                                <Text style={styles.liveText}>LIVE</Text>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.pulseRing}>
                            <Ionicons name="notifications" size={32} color="white" />
                        </View>
                    )}

                   <Text style={styles.incomingTitle}>{displayName} at Door</Text>
                   <Text style={styles.incomingSub}>
  {displayName} is requesting a video call for House {userDetails?.houseNo || 'N/A'}
</Text>

                    {/* QUICK REPLIES SECTION */}
                    <View style={styles.quickReplyContainer}>
                        <Text style={styles.quickReplyTitle}>Quick Reply</Text>
                        <View style={styles.quickReplyRow}>
                            <TouchableOpacity style={styles.quickReplyBtn} onPress={() => sendQuickReply("Wait a minute, please!")}>
                                <Text style={styles.quickReplyBtnText}>Wait 1 Min</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.quickReplyBtn} onPress={() => sendQuickReply("I am coming!")}>
                                <Text style={styles.quickReplyBtnText}>Coming!</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.quickReplyBtn} onPress={() => sendQuickReply("Leave at door.")}>
                                <Text style={styles.quickReplyBtnText}>Leave at Door</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.incomingButtonsRow}>
                        <TouchableOpacity style={styles.declineBtn} onPress={declineCall}>
                            <Ionicons name="close" size={28} color="white" />
                            <Text style={styles.incomingBtnText}>Decline</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
                            <Ionicons name="videocam" size={28} color="white" />
                            <Text style={styles.incomingBtnText}>Accept</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlayDark: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
    },
    incomingCallCard: {
        width: '85%',
        backgroundColor: '#1C1C1E',
        borderRadius: 35,
        padding: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    visitorThumbnailContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#007AFF',
        overflow: 'hidden',
        marginBottom: 20,
        backgroundColor: '#2C2C2E'
    },
    visitorThumbnail: {
        width: '100%',
        height: '100%',
    },
    liveBadge: {
        position: 'absolute',
        bottom: 5,
        alignSelf: 'center',
        backgroundColor: '#FF3B30',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'white',
        marginRight: 4
    },
    liveText: {
        color: 'white',
        fontSize: 8,
        fontWeight: '900'
    },
    pulseRing: {
        width: 84,
        height: 84,
        borderRadius: 42,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    incomingTitle: { color: 'white', fontSize: 24, fontWeight: '900' },
    incomingSub: {
        color: '#8E8E93',
        textAlign: 'center',
        marginTop: 12,
        marginBottom: 30,
        fontSize: 15,
        lineHeight: 22
    },
    incomingButtonsRow: { flexDirection: 'row', width: '100%' },
    declineBtn: {
        flex: 1,
        backgroundColor: '#FF3B30',
        height: 70,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },
    acceptBtn: {
        flex: 1,
        backgroundColor: '#34C759',
        height: 70,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10
    },
    incomingBtnText: { color: 'white', fontWeight: '800', marginTop: 4, fontSize: 13 },

    // Quick Replies
    quickReplyContainer: { width: '100%', marginBottom: 25, backgroundColor: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 20 },
    quickReplyTitle: { color: '#007AFF', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center', letterSpacing: 1 },
    quickReplyRow: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
    quickReplyBtn: { backgroundColor: 'rgba(0,122,255,0.15)', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,122,255,0.3)', margin: 2 },
    quickReplyBtnText: { color: '#007AFF', fontSize: 11, fontWeight: '800' },
});
