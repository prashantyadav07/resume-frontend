import { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  LogIn, 
  LogOut, 
  User,
  BarChart4,
  Clock,
  ChevronRight,
  Github,
  Trash2,
  Search,
  X,
  RefreshCw
} from 'lucide-react';
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from '@/components/ui/alert';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Progress
} from '@/components/ui/progress';
import { 
  Input 
} from '@/components/ui/input';
import { 
  Badge 
} from '@/components/ui/badge';

// Base URL for API
const API_BASE_URL = 'https://resume-backend-2zxa.onrender.com/api/v1';

export default function ResumeAnalyzerHomepage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userName, setUserName] = useState('User');
  const [loginUsername, setLoginUsername] = useState('');

  // PDFUploader states
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [analysisData, setAnalysisData] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const [uploadedDocId, setUploadedDocId] = useState(null);

  // Fetch documents when logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchDocuments();
    }
  }, [isLoggedIn]);

  // Auto-analyze after upload if we have a document ID
  useEffect(() => {
    if (uploadedDocId) {
      analyzeDocument(uploadedDocId);
      setUploadedDocId(null);
    }
  }, [uploadedDocId]);

  const signInDirect = () => {
    if (!loginUsername.trim()) {
      setNotification({
        type: 'error',
        message: 'Please enter a username'
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    setIsUploading(true);
    setTimeout(() => {
      setIsLoggedIn(true);
      setUserName(loginUsername.trim());
      setShowLoginModal(false);
      setLoginUsername('');
      setNotification({
        type: 'success',
        message: `Welcome, ${loginUsername.trim()}!`
      });
      setTimeout(() => setNotification(null), 3000);
      setIsUploading(false);
    }, 1000);
  };

  const signOut = () => {
    setIsLoggedIn(false);
    setShowUploadModal(false);
    setUploadedFile(null);
    setFile(null);
    setProgress(0);
    setUploading(false);
    setUploaded(false);
    setError(null);
    setDocuments([]);
    setSearchQuery('');
    setAnalysisData(null);
    setIsDeleting(false);
    setLoading(true);
    setUploadedDocId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setUserName('User');
    setNotification({
      type: 'info',
      message: 'You have been signed out'
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmitFile = () => {
    if (!uploadedFile) return;

    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setNotification({
            type: 'success',
            message: 'Resume uploaded successfully! Analysis in progress.'
          });
          setTimeout(() => {
            setShowUploadModal(false);
            setNotification(null);
          }, 2000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const openUploadModal = () => {
    setShowUploadModal(true);
  };

  const openLoginModal = () => {
    setShowLoginModal(true);
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/pdf`);
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setDocuments(data.data.documents);
      } else {
        throw new Error(data.message || 'Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError(`Failed to load documents: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const searchDocuments = async () => {
    setLoading(true);
    if (!searchQuery.trim()) {
      fetchDocuments();
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/pdf/search?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setDocuments(data.data || []);
        setError(null);
      } else {
        throw new Error(data.message || 'Search failed');
      }
    } catch (error) {
      console.error('Error searching documents:', error);
      setError(`Search failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError(null);
      } else {
        setFile(null);
        setError("Please select a PDF file");
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setError(null);
      } else {
        setError("Please drop a PDF file");
      }
    }
  };

  const uploadFile = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setError(null);
    const formData = new FormData();
    formData.append('pdf', file);
    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);
      const response = await fetch(`${API_BASE_URL}/pdf/upload`, {
        method: 'POST',
        body: formData,
      });
      clearInterval(progressInterval);
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Server returned status ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setProgress(100);
        setUploaded(true);
        setUploading(false);
        if (data.data && data.data.document && data.data.document._id) {
          setUploadedDocId(data.data.document._id);
        }
        fetchDocuments();
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err) {
      setProgress(0);
      setUploading(false);
      setError(err.message || 'Error uploading file');
      console.error('Upload error:', err);
    }
  };

  const clearFile = () => {
    setFile(null);
    setProgress(0);
    setUploading(false);
    setUploaded(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const analyzeDocument = async (id) => {
    try {
      setAnalysisData({ loading: true });
      const response = await fetch(`${API_BASE_URL}/gemini/analyze/${id}`);
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setAnalysisData(data.data || data);
        setError(null);
      } else {
        throw new Error(data.message || 'Analysis failed');
      }
    } catch (error) {
      setError(`Error analyzing document: ${error.message}`);
      setAnalysisData(null);
      console.error('Error analyzing document:', error);
    }
  };

  const deleteDocument = async (id) => {
    try {
      setIsDeleting(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/pdf/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Server returned status ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setDocuments(prevDocs => prevDocs.filter(doc => doc._id !== id));
        if (analysisData && analysisData.documentId === id) {
          setAnalysisData(null);
        }
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to delete document');
      }
    } catch (error) {
      setError(`Error deleting document: ${error.message}`);
      console.error('Error deleting document:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchDocuments();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Resume Analyzer</span>
            </div>
            <div className="flex items-center">
              {isLoggedIn ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{userName}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button onClick={openLoginModal} disabled={isUploading}>
                  {isUploading ? 
                    <Clock className="h-4 w-4 mr-2 animate-spin" /> : 
                    <LogIn className="h-4 w-4 mr-2" />
                  }
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Notification */}
        {notification && (
          <div className="mb-6">
            <Alert variant={notification.type === 'success' ? 'default' : notification.type === 'error' ? 'destructive' : 'default'}>
              {notification.type === 'success' ? 
                <CheckCircle className="h-4 w-4" /> : 
                <AlertCircle className="h-4 w-4" />
              }
              <AlertTitle>{notification.type === 'success' ? 'Success' : notification.type === 'error' ? 'Error' : 'Info'}</AlertTitle>
              <AlertDescription>{notification.message}</AlertDescription>
            </Alert>
          </div>
        )}

        {isLoggedIn ? (
          // PDFUploader content
          <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden z-0">
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-blue-400 blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
                <div className="absolute top-40 right-20 w-72 h-72 rounded-full bg-purple-400 blur-3xl animate-pulse" style={{ animationDuration: '12s' }}></div>
                <div className="absolute bottom-20 left-1/4 w-80 h-80 rounded-full bg-indigo-400 blur-3xl animate-pulse" style={{ animationDuration: '10s' }}></div>
                <div className="absolute -bottom-10 right-1/3 w-64 h-64 rounded-full bg-sky-400 blur-3xl animate-pulse" style={{ animationDuration: '15s' }}></div>
              </div>
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
                <svg className="w-full h-full text-indigo-500 opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  <path d="M0,50 Q30,40 50,50 T100,50 V100 H0 Z" fill="url(#grad)" />
                </svg>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="w-full max-w-6xl mx-auto p-4 md:p-6 relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 inline-block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  RESUME ANALYZER
                </h2>
                <div className="h-1 w-32 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </div>
              
              {error && (
                <Alert variant="destructive" className="mb-4 animate-fadeIn shadow-lg border-l-4 border-red-500">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute top-2 right-2 h-6 w-6 p-0" 
                    onClick={() => setError(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </Alert>
              )}
              
              {uploaded && !analysisData && (
                <Alert className="mb-4 bg-green-50 border-green-200 animate-fadeIn shadow-lg border-l-4 border-green-500">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>Your PDF has been uploaded successfully! Analyzing document...</AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-blue-100 backdrop-blur-sm bg-white/90">
                    <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                      <h3 className="font-semibold text-lg">Upload New Document</h3>
                    </div>
                    
                    {!file ? (
                      <div 
                        className="border-2 border-dashed rounded-lg m-4 p-8 text-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 group"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                      >
                        <div className="transform transition-all duration-300 group-hover:scale-110">
                          <Upload className="mx-auto h-16 w-16 text-blue-400 mb-4" />
                          <p className="text-lg font-medium mb-2">Drag & drop your PDF here</p>
                          <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                          <Button 
                            type="button" 
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white transition-all duration-300 shadow-md hover:shadow-lg"
                          >
                            Select PDF File
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="p-4">
                        <div className="flex items-center mb-4 bg-blue-50 rounded-lg p-3 shadow-inner">
                          <FileText className="h-10 w-10 text-blue-500 mr-3" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={clearFile} 
                            className="text-gray-500 hover:text-red-500 transition-colors duration-200"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                        
                        {(uploading || uploaded) && (
                          <div className="mb-4">
                            <Progress 
                              value={progress} 
                              className="h-2" 
                              indicatorClassName={uploaded ? "bg-green-500" : "bg-blue-500"}
                            />
                            <p className="text-xs text-gray-500 text-right mt-1">{progress}%</p>
                          </div>
                        )}
                        
                        {!uploading && !uploaded && (
                          <Button 
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-md hover:shadow-lg" 
                            onClick={uploadFile}
                            disabled={uploading}
                          >
                            Upload & Analyze PDF
                          </Button>
                        )}
                        
                        {uploaded && (
                          <Button 
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-md hover:shadow-lg"
                            onClick={clearFile}
                          >
                            Upload Another PDF
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-indigo-100 backdrop-blur-sm bg-white/90">
                  <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Document Library</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={fetchDocuments} 
                      disabled={loading}
                      className="text-white hover:text-indigo-100"
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex gap-2 mb-4">
                      <Input
                        type="text"
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 border-indigo-200 focus:border-indigo-400 focus:ring-indigo-300"
                      />
                      <Button 
                        onClick={searchDocuments}
                        className="bg-indigo-500 hover:bg-indigo-600 transition-colors duration-200 shadow-md hover:shadow-lg"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </Button>
                    </div>
                    
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent">
                      {loading ? (
                        <div className="flex justify-center items-center h-32">
                          <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin" />
                        </div>
                      ) : documents.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed rounded-lg">
                          <FileText className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                          <p className="text-gray-500">No documents found</p>
                        </div>
                      ) : (
                        documents.map((doc) => (
                          <div 
                            key={doc._id} 
                            className="border rounded-lg hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
                          >
                            <div className="flex items-center p-3 bg-gradient-to-r from-white to-indigo-50">
                              <FileText className="h-6 w-6 text-indigo-500 mr-3 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{doc.filename}</p>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs bg-indigo-50">
                                    {doc.metaData?.pageCount || 0} pages
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {new Date(doc.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-between p-2 bg-gray-50 border-t">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => analyzeDocument(doc._id)}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                Analyze
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this document?')) {
                                    deleteDocument(doc._id);
                                  }
                                }}
                                disabled={isDeleting}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {analysisData && (
                <div className="mt-6 bg-white shadow-xl rounded-xl overflow-hidden border border-purple-100 backdrop-blur-sm bg-white/90 animate-fadeIn transform transition-all duration-500">
                  <div className="p-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white flex justify-between items-center">
                    <h3 className="font-semibold text-lg">
                      {analysisData.loading ? 'Analyzing Document...' : `Analysis Summary for ${analysisData.resumeName || 'Document'}`}
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setAnalysisData(null)}
                      className="text-white hover:text-gray-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {analysisData.loading ? (
                    <div className="flex justify-center items-center h-32">
                      <RefreshCw className="h-8 w-8 text-blue-400 animate-spin" />
                    </div>
                  ) : (
                    <div className="p-4 md:p-6 space-y-6">
                      <div className="flex flex-wrap gap-4 mb-4">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 flex-1 min-w-48 shadow-inner">
                          <h4 className="text-sm text-gray-500 mb-1">Overall Score</h4>
                          <div className="text-2xl font-bold text-blue-700">{analysisData.analysis?.overallScore || 'N/A'}</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-lg mb-2 text-green-800 border-b pb-1">Top Key Strengths</h4>
                        {analysisData.analysis?.keyStrengths?.length > 0 ? (
                          <ul className="space-y-1">
                            {analysisData.analysis.keyStrengths.slice(0, 3).map((strength, index) => (
                              <li key={index} className="flex items-start p-2 hover:bg-green-50 rounded-lg transition-colors duration-200">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                                <span className="text-gray-700">{strength}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500">No key strengths identified</p>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-lg mb-2 text-amber-800 border-b pb-1">Top Priority Improvements</h4>
                        {analysisData.analysis?.priorityImprovements?.length > 0 ? (
                          <ul className="space-y-1">
                            {analysisData.analysis.priorityImprovements.slice(0, 3).map((improvement, index) => (
                              <li key={index} className="flex items-start p-2 hover:bg-amber-50 rounded-lg transition-colors duration-200">
                                <AlertCircle className="h-4 w-4 text-amber-500 mr-2 mt-1 flex-shrink-0" />
                                <span className="text-gray-700">{improvement}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500">No priority improvements suggested</p>
                        )}
                      </div>
                      
                      {analysisData.analysis?.overallAssessment && (
                        <div>
                          <h4 className="font-semibold text-lg mb-2 text-indigo-800 border-b pb-1">Overall Assessment</h4>
                          <p className="text-gray-700 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg shadow-inner">{analysisData.analysis.overallAssessment}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Original homepage content
          <>
            {/* Hero section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
                <span className="block">Optimize Your Resume</span>
                <span className="block text-blue-600 dark:text-blue-400">Get Hired Faster</span>
              </h1>
              <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-400">
                Upload your resume and get instant feedback, ATS optimization tips, and keyword analysis.
              </p>
              <div className="mt-8 flex justify-center">
                {/*  */}
              </div>
            </div>

            {/* Features section */}
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-600 dark:text-blue-400">
                    <BarChart4 className="h-5 w-5 mr-2" />
                    ATS Score Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Get an applicant tracking system (ATS) compatibility score and recommendations to improve it.
                  </CardDescription>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="text-sm" disabled={!isLoggedIn}>
                    Learn more <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-600 dark:text-blue-400">
                    <FileText className="h-5 w-5 mr-2" />
                    Keyword Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Analyze your resume against job descriptions to identify missing keywords and improve match rate.
                  </CardDescription>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="text-sm" disabled={!isLoggedIn}>
                    Learn more <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-600 dark:text-blue-400">
                    <User className="h-5 w-5 mr-2" />
                    Professional Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Receive personalized suggestions on content, formatting, and structure from industry experts.
                  </CardDescription>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="text-sm" disabled={!isLoggedIn}>
                    Learn more <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* How it works section */}
            <div className="mt-20">
              <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">How It Works</h2>
              <div className="grid gap-8 md:grid-cols-3">
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <Upload className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">1. Upload Resume</h3>
                  <p className="text-gray-500 dark:text-gray-400">Upload your resume in PDF</p>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <BarChart4 className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">2. Analyze</h3>
                  <p className="text-gray-500 dark:text-gray-400">Our AI analyzes your resume against best practices and job requirements.</p>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">3. Get Results</h3>
                  <p className="text-gray-500 dark:text-gray-400">Receive detailed feedback and actionable improvements.</p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">Resume Analyzer</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                Terms
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                Privacy
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                Contact
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center">
                <Github className="h-4 w-4 mr-1" />
                GitHub
              </a>
            </div>
          </div>
          <div className="mt-4 text-center md:text-left text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Resume Analyzer. All rights reserved.
          </div>
        </div>
      </footer>
      
      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Your Resume</DialogTitle>
            <DialogDescription>
              Upload your resume for analysis. We support PDF.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {!uploadedFile ? (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12">
                <Upload className="h-10 w-10 text-gray-400 mb-4" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">
                  Drag & drop your resume here or click to browse
                </p>
                <input
                  type="file"
                  id="resume-upload"
                  className="hidden"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileUpload}
                />
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('resume-upload').click()}
                >
                  Select File
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {uploadedFile.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setUploadedFile(null)}
                  >
                    Replace
                  </Button>
                </div>
                
                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Uploading...</span>
                      <span className="text-gray-900 dark:text-white">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowUploadModal(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitFile}
              disabled={!uploadedFile || uploadProgress > 0}
            >
              {uploadProgress > 0 ? 'Uploading...' : 'Upload & Analyze'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Login Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign In</DialogTitle>
            <DialogDescription>
              Enter your username to sign in and access resume analysis features.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Input
              type="text"
              placeholder="Enter your username"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              className="border-gray-300 dark:border-gray-700"
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowLoginModal(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={signInDirect}
              disabled={isUploading}
            >
              {isUploading ? 'Signing in...' : 'Sign In'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}