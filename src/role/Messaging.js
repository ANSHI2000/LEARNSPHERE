import React, { useState, useEffect } from 'react';
import * as apiClient from '../api/apiClient';
import './Messaging.css';

const Messaging = ({ currentUserId, currentUserRole }) => {
  const [activeView, setActiveView] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Form state for composing new message
  const [composeForm, setComposeForm] = useState({
    receiverId: null,
    subject: '',
    content: '',
  });

  // Load inbox on mount
  useEffect(() => {
    if (!currentUserId) {
      console.warn('No currentUserId provided to Messaging component');
      return;
    }

    if (currentUserRole === 'student') {
      loadInstructors();
    } else if (currentUserRole === 'instructor') {
      // Load all students for instructor
      loadStudents();
    }
    loadInbox();
  }, [currentUserId, currentUserRole]);

  const loadInbox = async () => {
    try {
      if (!currentUserId) {
        console.warn('⚠️ Cannot load inbox: currentUserId is', currentUserId);
        return;
      }
      
      setLoading(true);
      console.log('📬 Loading inbox for userId:', currentUserId);
      
      const response = await apiClient.messageAPI.getInbox(currentUserId);
      const data = response.data || response;
      
      console.log('📬 Inbox loaded:', {
        messageCount: data.messages?.length || 0,
        unreadCount: data.unreadCount,
      });
      
      setMessages(data.messages || []);
      setUnreadCount(data.unreadCount || 0);
      setError(null);
    } catch (err) {
      console.error('❌ Inbox load error:', {
        userId: currentUserId,
        error: err.message,
        response: err.response,
      });
      setMessages([]);
      setUnreadCount(0);
      setError('Failed to load inbox. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadSent = async () => {
    try {
      if (!currentUserId) return;
      
      setLoading(true);
      const response = await apiClient.messageAPI.getSent(currentUserId);
      const data = response.data || response;
      setMessages(data.messages || []);
      setError(null);
    } catch (err) {
      console.error('Sent load error:', err);
      setMessages([]);
      setError('Failed to load sent messages. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadInstructors = async () => {
    try {
      if (!currentUserId) {
        console.warn('⚠️ Cannot load instructors: currentUserId is', currentUserId);
        return;
      }
      
      console.log('👨‍🏫 Loading instructors for student:', currentUserId);
      
      const response = await apiClient.messageAPI.getInstructors(currentUserId);
      const data = response.data || response;
      const instructorsList = data.instructors || [];
      
      console.log('👨‍🏫 Instructors loaded:', instructorsList.map(i => ({
        id: i.id,
        name: i.name,
        role: i.role,
      })));
      
      setInstructors(instructorsList);
    } catch (err) {
      console.error('❌ Failed to load instructors:', {
        userId: currentUserId,
        error: err.message,
        response: err.response,
      });
      // If error, still allow messaging to work
      setInstructors([]);
    }
  };

  const loadStudents = async () => {
    try {
      // For instructors, get all students from their courses
      console.log('👥 Loading students from instructor courses...');
      
      const response = await apiClient.courseAPI.getInstructorCourses();
      const responseData = response?.data || response || [];
      const courses = Array.isArray(responseData) ? responseData : responseData.courses || [];
      
      console.log('👥 Fetched courses:', {
        courseCount: courses.length,
        courses: courses.map(c => ({ id: c.id, title: c.title })),
      });
      
      const studentsMap = new Map();
      
      if (Array.isArray(courses)) {
        courses.forEach((course) => {
          if (course && course.enrollments && Array.isArray(course.enrollments)) {
            console.log(`  📚 Course "${course.title}" has ${course.enrollments.length} enrollments`);
            
            course.enrollments.forEach((enrollment) => {
              if (enrollment && enrollment.student && enrollment.student.id) {
                studentsMap.set(enrollment.student.id, enrollment.student);
              }
            });
          }
        });
      }

      const students = Array.from(studentsMap.values());
      console.log('👥 Students loaded for instructor:', students.map(s => ({
        id: s.id,
        name: s.name,
        email: s.email,
      })));
      
      setInstructors(students);
    } catch (err) {
      console.error('❌ Failed to load students:', {
        error: err.message,
        response: err.response,
      });
      setInstructors([]);
    }
  };

  const loadConversation = async (instructorId) => {
    try {
      setLoading(true);
      const response = await apiClient.messageAPI.getConversation(
        currentUserId,
        instructorId
      );
      const data = response.data || response;
      setConversation(data.messages || []);
      setSelectedInstructor(
        instructors.find((i) => i.id === instructorId)
      );
      setError(null);
    } catch (err) {
      console.error('Conversation load error:', err);
      setConversation([]);
      setError('Failed to load conversation. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    console.log('Send message attempt:', {
      currentUserId,
      receiverId: composeForm.receiverId,
      subject: composeForm.subject,
      contentLength: composeForm.content.length,
    });

    if (!currentUserId) {
      setError('❌ User ID not found. Please log in again.');
      return;
    }

    if (!composeForm.receiverId) {
      setError('Please select a recipient');
      return;
    }

    if (!composeForm.subject.trim() || !composeForm.content.trim()) {
      setError('Subject and message content are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const senderId = parseInt(currentUserId);
      const receiverId = parseInt(composeForm.receiverId);
      
      console.log('📤 Sending message with params:', {
        senderId,
        receiverId,
        subject: composeForm.subject.trim(),
        content: composeForm.content.trim().substring(0, 50) + '...',
      });
      
      if (isNaN(senderId)) {
        throw new Error(`Invalid senderId: ${currentUserId}`);
      }
      if (isNaN(receiverId)) {
        throw new Error(`Invalid receiverId: ${composeForm.receiverId}`);
      }

      const response = await apiClient.messageAPI.send(
        senderId,
        receiverId,
        composeForm.subject.trim(),
        composeForm.content.trim()
      );

      console.log('✅ Message sent successfully:', response);

      setComposeForm({
        receiverId: null,
        subject: '',
        content: '',
      });

      setActiveView('sent');
      await loadSent();
      alert('✅ Message sent successfully!');
    } catch (err) {
      console.error('❌ Send message error:', {
        error: err.message,
        response: err.response,
        stack: err.stack,
      });
      const errorMsg = err.response?.data?.error || err.message || 'Failed to send message';
      setError('❌ ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await apiClient.messageAPI.markAsRead(messageId);
      loadInbox();
    } catch (err) {
      console.error('Failed to mark message as read:', err);
      setError('Failed to mark message as read.');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await apiClient.messageAPI.delete(messageId);
        if (activeView === 'inbox') {
          loadInbox();
        } else {
          loadSent();
        }
      } catch (err) {
        setError('Failed to delete message');
        console.error(err);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <div className="messaging-container">
      <div className="messaging-header">
        <h2>Messages</h2>
        {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="messaging-tabs">
        <button
          className={`tab-button ${activeView === 'inbox' ? 'active' : ''}`}
          onClick={() => {
            setActiveView('inbox');
            loadInbox();
          }}
        >
          Inbox
        </button>
        <button
          className={`tab-button ${activeView === 'sent' ? 'active' : ''}`}
          onClick={() => {
            setActiveView('sent');
            loadSent();
          }}
        >
          Sent
        </button>
        <button
          className={`tab-button ${activeView === 'compose' ? 'active' : ''}`}
          onClick={() => setActiveView('compose')}
        >
          Compose
        </button>
        {currentUserRole !== 'student' && (
          <button
            className={`tab-button ${
              activeView === 'conversations' ? 'active' : ''
            }`}
            onClick={() => setActiveView('conversations')}
          >
            Conversations
          </button>
        )}
      </div>

      <div className="messaging-content">
        {activeView === 'inbox' && (
          <div className="messages-list">
            {loading ? (
              <p>Loading messages...</p>
            ) : messages.length === 0 ? (
              <p className="empty-state">No messages in your inbox</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message-item ${!msg.isRead ? 'unread' : ''}`}
                  onClick={() => {
                    setSelectedMessage(msg);
                    if (!msg.isRead) {
                      handleMarkAsRead(msg.id);
                    }
                  }}
                >
                  <div className="message-sender">
                    <strong>{msg.sender.name}</strong>
                    <span className="message-role">{msg.sender.role}</span>
                  </div>
                  <div className="message-subject">{msg.subject}</div>
                  <div className="message-preview">
                    {msg.content.substring(0, 60)}
                    {msg.content.length > 60 ? '...' : ''}
                  </div>
                  <div className="message-meta">
                    <span className="message-date">{formatDate(msg.createdAt)}</span>
                    {!msg.isRead && <span className="unread-indicator">●</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeView === 'sent' && (
          <div className="messages-list">
            {loading ? (
              <p>Loading messages...</p>
            ) : messages.length === 0 ? (
              <p className="empty-state">No sent messages</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className="message-item"
                  onClick={() => setSelectedMessage(msg)}
                >
                  <div className="message-sender">
                    <strong>To: {msg.receiver.name}</strong>
                    <span className="message-role">{msg.receiver.role}</span>
                  </div>
                  <div className="message-subject">{msg.subject}</div>
                  <div className="message-preview">
                    {msg.content.substring(0, 60)}
                    {msg.content.length > 60 ? '...' : ''}
                  </div>
                  <div className="message-meta">
                    <span className="message-date">{formatDate(msg.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeView === 'compose' && (
          <div className="compose-form">
            <h3>Send a New Message</h3>
            
            {instructors.length === 0 ? (
              <div className="no-recipients-message">
                <p>
                  {currentUserRole === 'student' 
                    ? '📚 No instructors available. Please enroll in a course first.' 
                    : '👥 No students available. Please create a course and enroll students.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage}>
                <div className="form-group">
                  <label htmlFor="recipient">Send to:</label>
                  <select
                    id="recipient"
                    value={composeForm.receiverId || ''}
                    onChange={(e) =>
                      setComposeForm({
                        ...composeForm,
                        receiverId: parseInt(e.target.value),
                      })
                    }
                    required
                  >
                    <option value="">Select a recipient...</option>
                    {instructors.map((instructor) => (
                      <option key={instructor.id} value={instructor.id}>
                        {instructor.name} ({instructor.role || 'user'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject:</label>
                  <input
                    id="subject"
                    type="text"
                    value={composeForm.subject}
                    onChange={(e) =>
                      setComposeForm({
                        ...composeForm,
                        subject: e.target.value,
                      })
                    }
                    placeholder="Enter message subject"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="content">Message:</label>
                  <textarea
                    id="content"
                    value={composeForm.content}
                    onChange={(e) =>
                      setComposeForm({
                        ...composeForm,
                        content: e.target.value,
                      })
                    }
                    placeholder="Write your message here..."
                    rows="8"
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-send" disabled={loading}>
                    {loading ? '⏳ Sending...' : '✉️ Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {activeView === 'conversations' && (
          <div className="conversations-view">
            <div className="students-list">
              <h3>Student Conversations</h3>
              {/* This would show list of students who have messaged the instructor */}
              <p>Select a conversation from your inbox to view it here.</p>
            </div>
          </div>
        )}
      </div>

      {selectedMessage && (
        <div className="message-detail-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{selectedMessage.subject}</h3>
              <button
                className="close-btn"
                onClick={() => setSelectedMessage(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="message-from">
                <strong>From:</strong> {selectedMessage.sender.name} (
                {selectedMessage.sender.email})
              </div>
              <div className="message-date">
                {new Date(selectedMessage.createdAt).toLocaleString()}
              </div>
              <div className="message-body">{selectedMessage.content}</div>
            </div>

            <div className="modal-actions">
              <button
                className="btn-delete"
                onClick={() => {
                  handleDeleteMessage(selectedMessage.id);
                  setSelectedMessage(null);
                }}
              >
                Delete
              </button>
              <button
                className="btn-close"
                onClick={() => setSelectedMessage(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messaging;
