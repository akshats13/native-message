import { StyleSheet, Text, View, ScrollView } from "react-native";
import React, { useState, useContext, useEffect } from "react";
import { UserType } from "../UserContext";
import { useNavigation } from "@react-navigation/native";
import UserChat from "../components/UserChat";

const ChatScreen = () => {
  const [acceptedFriends, setAcceptedFriends] = useState([]);
  const { userId, setUserId } = useContext(UserType);
  const navigation = useNavigation();
  useEffect(() => {
    const acceptedFriendsList = async () => {
      try {
        const reponse = await fetch(
          `http://localhost:8000/accepted-friends/${userId}`
        );
        //converting the result into json fromat with the next line
        const data = await reponse.json();

        if (reponse.ok) {
          setAcceptedFriends(data);
        }
      } catch (err) {
        console.log("Can't fetch the friends list", err);
      }
    };

    acceptedFriendsList();
  }, []);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Pressable>
        {acceptedFriends.map((item, index) => {
          <UserChat key={index} item={item} />;
        })}
      </Pressable>
    </ScrollView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({});
