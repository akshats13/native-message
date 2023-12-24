import { StyleSheet, Text, View } from "react-native";
import React, { useLayoutEffect, useContext, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { UserType } from "../UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";
import axios from "axios";
import User from "../components/User";

const HomeScreen = () => {
  const navigation = useNavigation();
  const { userId, setUserId } = useContext(UserType);
  const { users, setUsers } = useState([]);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>Native Chat</Text>
      ),
      headerRight: () => (
        <View>
          <Ionicons
            onPress={() => navigation.navigate("Chats")}
            name="chatbox-ellipse-outline"
            size={24}
            color="black"
          />
          <MaterialIcons
            onPress={() => navigator.navigate("Friends")}
            name="people-outline"
            size={24}
            color="black"
          />
        </View>
      ),
    });
  }, []);
  // the function that will fetch all the users
  useEffect(() => {
    const fetchUsers = async () => {
      const token = await AsyncStorage.getItem("authToken");
      const decodedToken = jwt_decode(token);
      const userId = decodedToken.userId;
      setUserId(userId);

      axios
        .get(`https://localhost:8000/users/${userId}`)
        .then((res) => {
          setUsers(res.data);
        })
        .catch((err) => {
          console.log("Error retrieving users", err);
        });
    };

    fetchUsers();
  }, []);

  console.log("users", users);
  return (
    <View>
      <View style={{ padding: 10 }}>
        {users.map((item, index) => {
          <User key={index} item={item} />;
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({});
