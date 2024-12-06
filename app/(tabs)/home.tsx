import { StyleSheet, ScrollView, TouchableOpacity, Image, View, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/Themed';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getBots = async (id) => {
  const response = await fetch(`https://app.tekoai.com/chatbotapi/chatbot/getChatbots/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }  
  const data = await response.json();
  return data;
};

export const getMessageCountByBot = async (id) => {
  const response = await fetch(`https://app.tekoai.com/chatbotapi/analysis/getMessageCountByBot/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data;
};

export const getGuestCountByBot = async (id) => {
  const response = await fetch(`https://app.tekoai.com/chatbotapi/analysis/getGuestCountByBot/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data;
};

export const getManualResCountByBot = async (id) => {
  const response = await fetch(`https://app.tekoai.com/chatbotapi/analysis/getManulResCountByBot/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data;
};

export default function HomePageScreen() {
  const [user, setUser] = useState(null);
  const [bots, setBots] = useState([]);
  const [selectedBot, setSelectedBot] = useState(null);
  const [messageCount, setMessageCount] = useState(null);
  const [guestCount, setGuestCount] = useState(null);
  const [manualResponses, setManualResponses] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [plan, setPlan] = useState(0);

  const planNames = ['Free', 'Personal', 'Business', 'Enterprise', 'Enterprise Pro'];

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData !== null) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setPlan(parsedUser.plan || 0);
          await getBotData(parsedUser.id);
        }
      } catch (error) {
        console.log('Error retrieving user data:', error);
      }
    };

    const getBotData = async (id) => {
      try {
        const botData = await getBots(id);
        setBots(botData);
        if (botData.length > 0) {
          setSelectedBot(botData[0].id);
          await refreshCounts(botData[0].id);
        }
      } catch (error) {
        console.log('Error retrieving bot data:', error);
      }
    };

    getUserData();
  }, []);

  const handleUpgradePlanPress = () => {
    setIsModalVisible(true);
  };

  const refreshCounts = async (botId) => {
    try {
      const messageCountData = await getMessageCountByBot(botId);
      const guestCountData = await getGuestCountByBot(botId);
      const manualResponsesData = await getManualResCountByBot(botId);
      setMessageCount(messageCountData.count);
      setGuestCount(guestCountData.count);
      setManualResponses(manualResponsesData.count);
    } catch (error) {
      console.log('Error refreshing counts:', error);
    }
  };

  const onBotChange = async (botId) => {
    setSelectedBot(botId);
    await refreshCounts(botId);
    try {
      const updatedUser = { ...user, selectedBot: botId };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.log('Error saving selected bot:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Ionicons name="person-circle" size={50} color="black" style={styles.profileImage} />
        <Picker
          selectedValue={selectedBot}
          style={styles.botPicker}
          onValueChange={(itemValue) => onBotChange(itemValue)}
        >
          {bots.map((bot) => (
            <Picker.Item key={bot.id} label={bot.name} value={bot.id} />
          ))}
        </Picker>
      </View>

      <View style={styles.helloContainer}>
        <Text style={styles.greeting}>Hello</Text>
        <Text style={styles.greeting}>{user?.username || 'Amilia Xxx'}!</Text>
      </View>

      <View style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 30 }}>
        <LinearGradient
          colors={['rgba(42, 50, 245, 0.64)', 'rgba(52, 248, 244, 0.64)']}
          start={{ x: 0.1, y: 0.1 }}
          end={{ x: 1, y: 1 }}
          style={styles.upgradeContainer}
        >
          <View style={styles.upgradeContentContainer}>
            <View style={styles.upgradeLeftContainer}>
              <Text style={[styles.upgradeText, { textAlign: 'left' }]}>TekoAI Business</Text>
              <Text style={[styles.upgradeSubtitle, { textAlign: 'left' }]}>Unlock more bot limits and valid chats</Text>
              <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgradePlanPress}>
                <Text style={styles.upgradeButtonText}>Upgrade</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.upgradeRightContainer}>
              <Image
                source={require('../../assets/images/upgrade.png')} // Replace with a real image URL
                style={styles.upgradeImage}
              />
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.analysisContainer}>
        <View style={styles.analysisCard}>
          <Ionicons name="file-tray-full-outline" size={44} color="blue" style={styles.profileImage} />
          <Text style={styles.analysisLabel}>Message Count</Text>
          <Text style={[styles.analysisValue, styles.messageCount]}>{messageCount}</Text>
        </View>
        <View style={styles.analysisCard}>
          <Ionicons name="people-outline" size={44} color="purple" style={styles.profileImage} />
          <Text style={styles.analysisLabel}>Guest Count</Text>
          <Text style={[styles.analysisValue, styles.guestCount]}>{guestCount}</Text>
        </View>
        <View style={styles.analysisCard}>
          <Ionicons name="chatbubbles-outline" size={44} color="red" style={styles.profileImage} />
          <Text style={styles.analysisLabel}>Manual Responses</Text>
          <Text style={[styles.analysisValue, styles.messageresCount]}>{manualResponses}</Text>
        </View>
        <View style={styles.analysisCard}>
          <Ionicons name="notifications-outline" size={44} color="orange" style={styles.profileImage} />
          <Text style={styles.analysisLabel}>Pop-Up Quantity</Text>
          <Text style={[styles.analysisValue, styles.popCount]}>{manualResponses}</Text>
        </View>
      </View>
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
  planName: {
    flex: 1,
    fontSize: 16,
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  planOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  planIcon: {
    marginRight: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  planCheckIcon: {
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    marginBottom: 20,
  },
  botPicker: {
    height: 50,
    width: 200,
    color: '#84A1C1'
  },
  helloContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  upgradeContainer: {
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  upgradeContentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upgradeLeftContainer: {
    alignItems: 'flex-start',
    width: '50%',
  },
  upgradeRightContainer: {
    width: '50%',
  },
  upgradeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#ffffff',
  },
  upgradeSubtitle: {
    fontSize: 13,
    color: '#ffffff',
    marginBottom: 15,
  },
  upgradeButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  upgradeButtonText: {
    color: 'blue',
    fontWeight: 'bold',
  },
  analysisContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  analysisCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'flex-start',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  analysisLabel: {
    fontSize: 16,
    color: '#777',
    marginBottom: 10,
  },
  analysisValue: {
    fontSize: 34,
    fontWeight: 'bold',
  },
  messageCount: {
    color: 'blue'
  },
  guestCount: {
    color: 'purple'
  },
  messageresCount: {
    color: 'red'
  },
  popCount: {
    color: 'orange'
  },
  upgradeImage: {
    width: 200,
    height: 150,
  },
});
