import { StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, FlatList, Modal } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';

export const getBots = async (id) => {
  const response = await fetch(`https://app.tekoai.com/chatbotapi/chatbot/getChatbots/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('getBots response was not ok');
  }
  const data = await response.json();
  return data;
};

export const getGuestConversations = async (guestId, botId) => {
  console.log("getGuestConversations", guestId, botId)
  const response = await fetch(`https://app.tekoai.com/chatbotapi/chatbot/getGuestConversations?guest_id=${guestId}&bot_id=${botId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('getGuestConversations response was not ok');
  }
  const data = await response.json();
  return data;
};

export const getBotChatsList = async (botId) => {
  const response = await fetch(`https://app.tekoai.com/chatbotapi/chatbot/getBotChatsListV3/${botId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('getBotChatsList response was not ok');
  }
  const data = await response.json();
  return data;
};

export default function HomePageScreen() {
  const [chatData, setChatData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChatData, setFilteredChatData] = useState([]);
  const [sortOption, setSortOption] = useState('name');
  const [selectedConversation, setSelectedConversation] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [message, setMessage] = useState('');
  const intervalRef = useRef(null);
  const previousConversationLengthRef = useRef(0);

  const fetchChatData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData !== null) {
        const parsedUser = JSON.parse(userData);
        let botId = parsedUser.selectedBot;

        if (!botId) {
          const botData = await getBots(parsedUser.id);
          if (botData.length > 0) {
            botId = botData[0].id;
          }
        }

        if (botId) {
          const data = await getBotChatsList(botId);
          setChatData(data);
          setFilteredChatData(data);
        }
      }
    } catch (error) {
      console.log('Error fetching chat data:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchChatData();
    }, [])
  );

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredChatData(chatData);
    } else {
      const filteredData = chatData.filter((chat) =>
        chat.guest_display_id.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredChatData(filteredData);
    }
  };

  const handleSort = (option) => {
    setSortOption(option);
    let sortedData = [...filteredChatData];
    if (option === 'name') {
      sortedData.sort((a, b) => a.guest_display_id.localeCompare(b.guest_display_id));
    } else if (option === 'editTime') {
      sortedData.sort((a, b) => new Date(b.create_at) - new Date(a.create_at));
    }
    setFilteredChatData(sortedData);
  };

  const openChatConversation = async (guestId, botId, guestInfo) => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData !== null) {
        if (!botId && userData !== null) {
          const parsedUser = JSON.parse(userData);
          const botData = await getBots(parsedUser.id);
          if (botData.length > 0) {
            botId = botData[0].id;
          }
        }
        const data = await getGuestConversations(guestId, botId);
        setSelectedConversation(data);
        setSelectedGuest(guestInfo);
        setIsModalVisible(true);
      }
    } catch (error) {
      console.log('Error fetching conversation:', error);
    }
  };

  const handleGoLive = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permissions not granted');
      return;
    }
    setIsLive(true);
    if (selectedGuest) {
      let botId = selectedGuest.bot_id;
      const guestId = selectedGuest.id;
      intervalRef.current = setInterval(async () => {
        try {
          const userData = await AsyncStorage.getItem('user');
          if (!botId && userData !== null) {
            const parsedUser = JSON.parse(userData);
            const botData = await getBots(parsedUser.id);
            if (botData.length > 0) {
              botId = botData[0].id;
            }
          }
          const data = await getGuestConversations(guestId, botId);
          setSelectedConversation(data);
          if (data.length !== previousConversationLengthRef.current) {
            sendNotification('New message received in conversation!');
            previousConversationLengthRef.current = data.length;
          }
        } catch (error) {
          console.log('Error fetching updated conversation:', error);
        }
      }, 3000);
    }
  };

  const sendNotification = async (message) => {
    console.log("sendNotification", message)
    try {
      const res = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Chat Update',
          body: message,
        },
        trigger: null,
      });
      console.log("res", res)
    } catch (error) {
      console.log('Error scheduling notification:', error);
    }
  };

  const handleBackButton = () => {
    setIsModalVisible(false);
    setIsLive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleSendMessage = async () => {
    if (message.trim() === '') return;
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData !== null && selectedGuest) {
        const parsedUser = JSON.parse(userData);
        let botId = parsedUser.selectedBot;

        if (!botId) {
          const botData = await getBots(parsedUser.id);
          if (botData.length > 0) {
            botId = botData[0].id;
          }
        }

        const sendMessageResponse = await fetch('https://app.tekoai.com/chatbotapi/liveChat/sendMessage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            guestId: selectedGuest.id,
            msg: message,
            // msgType: 'H',
          }),
        });

        if (!sendMessageResponse.ok) {
          throw new Error('sendMessageResponse was not ok');
        }

        const sendMessageRecordResponse = await fetch('https://app.tekoai.com/chatbotapi/liveChat/sendMessageRecord', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bot_id: botId,
            // client_flag: 'H',
            create_at: new Date().toISOString(),
            response_text: message,
            session_id: selectedConversation[0].session_id,
          }),
        });

        if (!sendMessageRecordResponse.ok) {
          throw new Error('sendMessageRecordResponse was not ok');
        }

        setMessage('');
      }
    } catch (error) {
      console.log('Error sending message:', error);
    }
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity onPress={() => openChatConversation(item.id, item.bot_id, item)} style={styles.chatItemContainer}>
      <Image source={{ uri: item.avatar.replace('/svg?', '/png?') }} style={styles.avatar} />
      <View style={styles.chatTextContainer}>
        <Text style={styles.chatName}>{item.guest_display_id}</Text>
        <Text style={styles.chatMessage}>{item.response_text || 'No response yet...'}</Text>
      </View>
      <View style={styles.chatStatusContainer}>
        <Text style={styles.chatTime}>{new Date(item.create_at).toLocaleTimeString()}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderConversationItem = ({ item }) => (
    <View style={[styles.messageBubbleWrapper, item.role === 'assistant' ? styles.assistantBubbleWrapper : styles.userBubbleWrapper]}>
      {item.role === 'assistant' ? <Image source={{ uri: selectedGuest.avatar.replace('/svg?', '/png?') }} style={styles.avatar} /> : ''}
      <View style={[styles.messageBubble, item.role === 'assistant' ? styles.assistantBubble : styles.userBubble]}>
        <Text style={styles.messageText}>{item.role === 'assistant' ? item.response_text : item.message}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search"
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterButton} onPress={() => handleSort('name')}>
          <Text>Online</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton} onPress={() => handleSort('editTime')}>
          <Text>Last Edit Time</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredChatData}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleBackButton}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedGuest && (
              <View style={styles.guestHeaderContainer}>
                <TouchableOpacity onPress={handleBackButton}>
                  <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Image source={{ uri: selectedGuest.avatar.replace('/svg?', '/png?') }} style={styles.avatar} />
                <View style={styles.guestInfoContainer}>
                  <Text style={styles.guestName}>{selectedGuest.guest_display_id}</Text>
                  <Text style={styles.guestId}>{'Guest_id ' + selectedGuest.id}</Text>
                </View>
                <TouchableOpacity>
                  <Ionicons name="ellipsis-horizontal" size={24} color="black" />
                </TouchableOpacity>
              </View>
            )}
            <FlatList
              data={selectedConversation}
              renderItem={renderConversationItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.conversationList}
            />
            {isLive ? (
              <View style={styles.messageInputContainer}>
                <Image source={{ uri: 'https://example.com/upload_icon.png' }} style={styles.uploadIcon} />
                <TextInput
                  style={styles.messageInput}
                  placeholder="Message..."
                  value={message}
                  onChangeText={setMessage}
                />
                <TouchableOpacity onPress={handleSendMessage}>
                  <Ionicons name="send-outline" size={24} color="gray" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={handleGoLive} style={styles.goLiveButton}>
                <Text style={styles.goLiveButtonText}>Go Live Now</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
  },
  guestHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 10,
  },
  guestAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  guestInfoContainer: {
    flex: 1,
  },
  guestName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  guestId: {
    fontSize: 13,
    color: '#9C9C9C'
  },
  searchBar: {
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginRight: 10
  },
  listContainer: {
    paddingBottom: 20,
  },
  chatItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  chatTextContainer: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatMessage: {
    fontSize: 12,
    color: '#777',
  },
  chatStatusContainer: {
    alignItems: 'flex-end',
  },
  chatTime: {
    fontSize: 14,
    color: '#777',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
  },
  conversationList: {
    paddingBottom: 20,
  },
  messageBubbleWrapper: {
    flexDirection: 'row',
  },
  assistantBubbleWrapper: {
    alignSelf: 'flex-start',
  },
  userBubbleWrapper: {
    alignSelf: 'flex-end',
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  assistantBubble: {
    backgroundColor: '#e0e0e0',
    alignSelf: 'flex-start',
  },
  userBubble: {
    backgroundColor: '#007aff',
    alignSelf: 'flex-end',
    color: '#fff',
  },
  messageText: {
    color: '#fff',
  },
  goLiveButton: {
    marginTop: 20,
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  goLiveButtonText: {
    color: '#ffffff',
    fontWeight: 'bold'
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 25,
    marginTop: 20,
    width: '100%',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    color: '#333',
  },
  uploadIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
});