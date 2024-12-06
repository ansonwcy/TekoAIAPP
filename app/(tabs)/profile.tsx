import { StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, FlatList, Modal } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBots } from './home';
import { useRouter } from 'expo-router';

export default function ProfilePageScreen() {
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [plan, setPlan] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);
  const [isChatbotModalVisible, setIsChatbotModalVisible] = useState(false);
  const [bots, setBots] = useState([]);
  const [selectedBot, setSelectedBot] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();

  const fetchProfileData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser) {
          setProfileName(parsedUser.username || '');
          setProfileEmail(parsedUser.email || '');
          setPlan(parsedUser.plan || 0);
          setUser(parsedUser);
          await fetchBots(parsedUser.id);
        }
      }
    } catch (error) {
      console.log('Error fetching profile data:', error);
    }
  };

  const fetchBots = async (userId) => {
    try {
      const botData = await getBots(userId);
      setBots(botData);
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser) {
          const selectedBot = botData.find(bot => bot.id === parsedUser.selectedBot);
          setSelectedBot(selectedBot);
        }
      }
    } catch (error) {
      console.log('Error fetching bots:', error);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const planNames = ['Free', 'Personal', 'Business', 'Enterprise', 'Enterprise Pro'];

  const handleUpgradePlanPress = () => {
    setIsModalVisible(true);
  };

  const handleChatbotPress = () => {
    setIsChatbotModalVisible(true);
  };

  const handleBotSelection = async (botId) => {
    setSelectedBot(botId);
    try {
      const updatedUser = { ...user, selectedBot: botId };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsChatbotModalVisible(false);
      fetchProfileData();
    } catch (error) {
      console.log('Error updating selected bot:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Ionicons name="person-circle" size={100} color="black" style={styles.profileImage} />
        <Text style={styles.profileName}>{profileName || 'Amilia Xxx'}</Text>
        <Text style={styles.profileEmail}>{profileEmail || 'amilia_xxx@example.com'}</Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionItem} onPress={handleUpgradePlanPress}>
          <MaterialIcons name="upgrade" size={24} color="black" />
          <Text style={styles.optionText}>Upgrade Plan</Text>
          <Text style={styles.optionDetail}>{planNames[plan]}</Text>
          <Ionicons name="chevron-forward" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionItem} onPress={handleChatbotPress}>
          <MaterialIcons name="chat" size={24} color="black" />
          <Text style={styles.optionText}>Chatbot</Text>
          <Text style={styles.optionDetail}>{selectedBot?.name}</Text>
          <Ionicons name="chevron-forward" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionItem}>
          <Ionicons name="language" size={24} color="black" />
          <Text style={styles.optionText}>Language</Text>
          <Text style={styles.optionDetail}>English</Text>
          <Ionicons name="chevron-forward" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionItem}>
          <MaterialIcons name="payment" size={24} color="black" />
          <Text style={styles.optionText}>Payment Setting</Text>
          <Ionicons name="chevron-forward" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionItem} onPress={() => setIsChangePasswordModalVisible(true)}>
          <MaterialIcons name="lock" size={24} color="black"  />
          <Text style={styles.optionText}>Change Password</Text>
          <Ionicons name="chevron-forward" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={() => {router.replace('/login');}}>
        <Ionicons name="log-out" size={24} color="red" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Upgrade Plan</Text>
            {planNames.map((planName, index) => (
              <TouchableOpacity key={index} style={styles.planOption}>
                <Ionicons name="diamond-outline" size={24} color="black" style={styles.planIcon} />
                <Text style={styles.planName}>{planName}</Text>
                {index === plan ? (
                  <Ionicons name="checkmark-circle" size={24} color="blue" style={styles.planCheckIcon} />
                ) : index >= plan ?
                  <Text style={styles.upgradeText}>{index > plan ? 'Upgrade' : ''}</Text> :
                  <Ionicons name="ellipse-outline" size={24} color="blue" style={styles.planCheckIcon} />
                }
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <Modal
        visible={isChatbotModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsChatbotModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => setIsChatbotModalVisible(false)} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Chatbot</Text>
            {bots.map((bot, index) => (
              <TouchableOpacity key={index} style={styles.planOption} onPress={() => handleBotSelection(bot.id)}>
                <Ionicons name="chatbubbles-outline" size={24} color="black" style={styles.planIcon} />
                <Text style={styles.planName}>{bot.name}</Text>
                {bot.id === selectedBot?.id ? (
                  <Ionicons name="checkmark-circle" size={24} color="blue" style={styles.planCheckIcon} />
                ) : (
                  <Ionicons name="ellipse-outline" size={24} color="black" style={styles.planCheckIcon} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addChatbotButton}>
              <Ionicons name="add-circle-outline" size={24} color="blue" />
              <Text style={styles.addChatbotText}>Add Chatbot</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isChangePasswordModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsChangePasswordModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => setIsChangePasswordModalVisible(false)} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TextInput placeholder="Current Password" secureTextEntry={true} style={styles.input} />
            <TextInput placeholder="Enter your new password" secureTextEntry={true} style={styles.input} />
            <TextInput placeholder="Re-enter your new password" secureTextEntry={true} style={styles.input} />
            <TouchableOpacity style={styles.submitButton} onPress={() => setIsChangePasswordModalVisible(false)}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: '#ffffff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileEmail: {
    fontSize: 16,
    color: '#777',
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionItem: {
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
  optionText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
  },
  optionDetail: {
    fontSize: 14,
    color: '#777',
    marginRight: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  logoutText: {
    fontSize: 16,
    color: 'red',
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  planOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  planIcon: {
    marginRight: 15,
  },
  planName: {
    flex: 1,
    fontSize: 16,
  },
  planCheckIcon: {
    marginRight: 10,
  },
  upgradeText: {
    color: 'blue',
  },
  addChatbotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 10,
  },
  addChatbotText: {
    fontSize: 16,
    color: 'blue',
    marginLeft: 10,
  },
});
