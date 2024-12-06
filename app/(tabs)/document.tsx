import { StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, FlatList, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Text, View } from '@/components/Themed';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as WebBrowser from 'expo-web-browser';

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

export default function HomePageScreen() {
  const [docList, setDocList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDocList, setFilteredDocList] = useState([]);
  const [sortOption, setSortOption] = useState('name');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchDocList = async () => {
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
          const response = await fetch(`https://app.tekoai.com/chatbotapi/training/getDocListById/${botId}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          setDocList(data);
          setFilteredDocList(data);
        }
      }
    } catch (error) {
      console.log('Error fetching document list:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchDocList();
    }, [])
  );

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredDocList(docList);
    } else {
      const filteredData = docList.filter((doc) =>
        doc.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredDocList(filteredData);
    }
  };

  const openDocument = async (item) => {
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
          const fileType = item.name.split('.').pop();
          const url = `https://app.tekoai.com/bot_document/${botId}/${item.document_id}.${fileType}`;
          await WebBrowser.openBrowserAsync(url);
        }
      }
    } catch (error) {
      console.log('Error opening document:', error);
    }
  };

  const handleSort = (option) => {
    setSortOption(option);
    let sortedData = [...filteredDocList];
    if (option === 'name') {
      sortedData.sort((a, b) => a.name.localeCompare(b.name));
    } else if (option === 'editTime') {
      sortedData.sort((a, b) => new Date(b.upload_time) - new Date(a.upload_time));
    } else if (option === 'size') {
      sortedData.sort((a, b) => parseInt(b.size) - parseInt(a.size));
    }
    setFilteredDocList(sortedData);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => openDocument(item)} style={styles.itemContainer}>
      <View style={styles.itemIconContainer}>
        {item.type === '1' && <MaterialIcons name="insert-drive-file" size={24} color="dodgerblue" />}
      </View>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemEditTime}>Upload time: {new Date(item.upload_time).toLocaleString()}</Text>
      </View>
      <TouchableOpacity style={styles.moreOptionsButton}>
        <Ionicons name="ellipsis-horizontal" size={24} color="black" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search"
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <Picker
        selectedValue={sortOption}
        style={styles.sortPicker}
        onValueChange={(itemValue) => handleSort(itemValue)}
      >
        <Picker.Item label="Sort by Name" value="name" />
        <Picker.Item label="Sort by Last Edit Time" value="editTime" />
        <Picker.Item label="Sort by Storage Size" value="size" />
      </Picker>
      <FlatList
        data={filteredDocList}
        renderItem={renderItem}
        keyExtractor={(item) => item.document_id.toString()}
        contentContainerStyle={styles.listContainer}
      />
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Document Preview:</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
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
    backgroundColor: '#ffffff'
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
  sortPicker: {
    width: 250,
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
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
  itemIconContainer: {
    marginRight: 15,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemEditTime: {
    fontSize: 12,
    color: '#777',
  },
  moreOptionsButton: {
    padding: 5,
  },
  modalContainer:
 {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  openButton: {
    marginTop: 20,
    backgroundColor: 'dodgerblue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  openButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: 'gray',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
