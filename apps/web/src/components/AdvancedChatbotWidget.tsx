import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MessageCircle, X, Send, Bot, User, HelpCircle, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { chatbotApi } from '../lib/api';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  intent?: string;
  entities?: Record<string, string>;
  actionButton?: { label: string; href: string };
  source?: string;
  faqMatch?: {
    id: string;
    question: string;
    similarity: number;
  };
}

interface AdvancedChatbotWidgetProps {
  className?: string;
}

export function AdvancedChatbotWidget({ className }: AdvancedChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatbotApi.askQuestion({
        question: inputValue,
        userRole: user?.role || 'EMPLOYEE'
      });

      // Handle both direct response and wrapped response
      const responseData = response.data || response;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseData.answer,
        isUser: false,
        timestamp: new Date(),
        confidence: responseData.confidence,
        intent: responseData.intent,
        entities: responseData.entities,
        actionButton: responseData.actionButton,
        source: responseData.source,
        faqMatch: responseData.faqMatch
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Advanced chatbot error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I encountered an error processing your question. Please try again or contact HR.',
        isUser: false,
        timestamp: new Date(),
        confidence: 'LOW',
        source: 'Error Handler'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getConfidenceIcon = (confidence?: string) => {
    switch (confidence) {
      case 'HIGH':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'MEDIUM':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'LOW':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getConfidenceColor = (confidence?: string) => {
    switch (confidence) {
      case 'HIGH':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleActionClick = (actionButton: { label: string; href: string }) => {
    // Navigate to the specified href
    window.location.href = actionButton.href;
  };

  return (
    <>
      {/* Advanced Chatbot Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg hover:scale-105 transition-transform ${className}`}
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Advanced Chatbot Widget */}
      {isOpen && (
        <Card className="fixed bottom-28 right-6 z-40 w-96 h-[500px] shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bot className="h-5 w-5" />
                COSTAATT HR Digital Assistant
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className="p-2"
                >
                  <TrendingUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMessages([])}
                  className="p-2"
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col h-full p-0">
            <div className="flex-1 px-4 overflow-y-auto">
              <div className="space-y-4 pb-6">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="font-medium">Hi! I'm your COSTAATT HR Digital Assistant.</p>
                    <p className="text-sm text-gray-400 mt-2">
                      I can help with performance appraisals, competencies, goals, and HR policies.
                    </p>
                    <div className="mt-4 space-y-2">
                      <p className="text-xs text-gray-400">Try asking:</p>
                      <div className="space-y-1">
                        <Button variant="outline" size="sm" className="text-xs h-8">
                          "How do I complete my appraisal?"
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs h-8">
                          "What are the competency areas?"
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.isUser
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      
                      {/* Advanced Features Display */}
                      {!msg.isUser && (
                        <div className="mt-2 space-y-2">
                          {/* Confidence Indicator */}
                          {msg.confidence && (
                            <div className="flex items-center gap-2">
                              {getConfidenceIcon(msg.confidence)}
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getConfidenceColor(msg.confidence)}`}
                              >
                                {msg.confidence} Confidence
                              </Badge>
                            </div>
                          )}
                          
                          {/* Intent Display */}
                          {msg.intent && (
                            <Badge variant="secondary" className="text-xs">
                              Intent: {msg.intent.replace('_', ' ')}
                            </Badge>
                          )}
                          
                          {/* FAQ Match Display */}
                          {msg.faqMatch && (
                            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                              <p className="font-medium">Matched FAQ:</p>
                              <p>"{msg.faqMatch.question}"</p>
                              <p className="text-gray-500">
                                Similarity: {Math.round(msg.faqMatch.similarity * 100)}%
                              </p>
                            </div>
                          )}
                          
                          {/* Action Button */}
                          {msg.actionButton && (
                            <Button
                              variant="link"
                              className="p-0 h-auto text-xs text-blue-600 mt-1 justify-start"
                              onClick={() => handleActionClick(msg.actionButton!)}
                            >
                              {msg.actionButton.label} →
                            </Button>
                          )}
                          
                          {/* Source Attribution */}
                          {msg.source && (
                            <p className="text-xs text-gray-500">
                              Source: {msg.source}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 text-gray-800">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        <p className="text-sm">Processing your question...</p>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* Advanced Input Area */}
            <div className="border-t p-4 bg-white">
              <div className="flex gap-3 items-center">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about appraisals, competencies, goals..."
                  disabled={isLoading}
                  className="flex-1 min-w-0"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="icon"
                  className="flex-shrink-0 w-10 h-10"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Quick Actions */}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => setInputValue('How do I complete my appraisal?')}
                >
                  Appraisal Help
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => setInputValue('What are the competency areas?')}
                >
                  Competencies
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => setInputValue('How do I set goals?')}
                >
                  Goal Setting
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
