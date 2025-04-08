"use client";

import { useState, useEffect } from "react";
import {
  getMessages,
  sendMessage,
  markMessageRead,
  checkOnlineStatus,
} from "../app/lib/api";
import { Message } from "../app/lib/types";
import socket from "../app/lib/socket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Triangle } from "react-loader-spinner";
import { ThreeDots } from "react-loader-spinner";

interface ChatProps {
  dealId: string;
}

export default function Chat({ dealId }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState<{
    buyer: { id: string; online: boolean };
    seller: { id: string; online: boolean };
  } | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await getMessages(dealId);
      setMessages(data.data);
      setLoading(false);
    };

    const fetchOnlineStatus = async () => {
      const { data } = await checkOnlineStatus(dealId);
      setOnlineStatus(data.data);
    };

    fetchMessages();
    fetchOnlineStatus();

    socket.on("newMessage", (message: Message) => {
      setMessages((prev) => [...prev, message]);
      if (!message.read) markMessageRead(dealId, message._id);
    });

    socket.on("userTyping", () => setTyping(true));
    socket.on("userStoppedTyping", () => setTyping(false));

    return () => {
      socket.off("newMessage");
      socket.off("userTyping");
      socket.off("userStoppedTyping");
    };
  }, [dealId]);

  const handleSend = async () => {
    if (!content) return;
    await sendMessage(dealId, content);
    setContent("");
    socket.emit("stopTyping", { dealId });
  };

  const handleTyping = () => {
    socket.emit("typing", { dealId });
    setTimeout(() => socket.emit("stopTyping", { dealId }), 2000);
  };

  return (
    <>
      {loading ? (
        <Triangle visible={true} height="80" width="80" color="#4fa94d" />
      ) : (
        <Card className="mt-4 animate-fade-in">
          <CardHeader>
            <CardTitle>Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64 mb-4">
              {messages.map((msg) => (
                <div key={msg._id} className="flex items-start mb-2">
                  <Avatar className="mr-2">
                    <AvatarFallback>{msg.sender.email[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex items-center">
                    <span className="font-semibold">{msg.sender.email}</span>

                    {onlineStatus && msg.sender && (
                      <span
                        className={`ml-2 h-3 w-3 rounded-full transition-colors duration-300 ${
                          (msg.sender._id === onlineStatus.buyer.id &&
                            onlineStatus.buyer.online) ||
                          (msg.sender._id === onlineStatus.seller.id &&
                            onlineStatus.seller.online)
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      ></span>
                    )}

                    <span>: {msg.content}</span>
                    {!msg.read ? (
                      <span className="text-xs text-gray-500 ml-2">New</span>
                    ) : (
                      <span className="text-xs text-gray-500 ml-2">✓</span>
                    )}
                  </div>
                </div>
              ))}

              {typing && (
                <div className="flex items-center">
                  <ThreeDots
                    visible={true}
                    height="20"
                    width="20"
                    color="	#A9A9A9"
                    radius="9"
                    ariaLabel="three-dots-loading"
                  />
                  <span className="ml-2 text-sm text-gray-500">
                    Someone is typing...
                  </span>
                </div>
              )}
            </ScrollArea>

            <div className="flex space-x-2">
              <Input
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  handleTyping();
                }}
                placeholder="Type a message..."
              />
              <Button className="cursor-pointer" onClick={handleSend}>Send</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
