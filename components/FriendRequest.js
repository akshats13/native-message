import { StyleSheet, Text, View } from "react-native";
import React, { useContext } from "react";
import { UserType } from "../UserContext";
import { useNavigation } from "@react-navigation/native";

const FriendRequest = (item, friendRequests, setFriendRequests) => {
  const { userId, setUserId } = useContext(UserType);
  const navigation = useNavigation();
  const acceptRequest = async (friendRequestId) => {
    try {
      const reponse = await fetch(
        "http://localhost:8000/friend-request/accept",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderId: friendRequestId,
            recepientId: userId,
          }),
        }
      );

      if (reponse.ok) {
        setFriendRequests(
          friendRequests.filter((request) => request._id !== friendRequestId),
          navigation.navigate("Chats")
        );
      }
    } catch (err) {
      console.log("Error accepting the friend request", err);
    }
  };
  return (
    <Pressable
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 10,
      }}
    >
      <Image
        style={{ width: 50, height: 50, borderRadius: 25 }}
        source={{ uri: item.image }}
      />

      <Text style={{ fontSize: 15, fontWeight: "bold", marginLeft: 10 }}>
        {item.name} sent you a friend request
      </Text>

      <Pressable
        onPress={() => acceptRequest(item._id)} //item._id -> the person who recieves the request
        style={{ backgroundColor: "#0066b2", padding: 10, borderRadius: 6 }}
      >
        <Text style={{ textAlign: "center", color: "white" }}>Accepet</Text>
      </Pressable>
    </Pressable>
  );
};

export default FriendRequest;

const styles = StyleSheet.create({});
