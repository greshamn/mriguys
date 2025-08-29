import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '../ui/dialog';
import { 
  Bookmark, 
  Clock, 
  MapPin, 
  X, 
  Search,
  Trash2
} from 'lucide-react';
import { Badge } from '../ui/badge';

export function Bookmarks({ onRestoreSearch }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load bookmarks from localStorage
  useEffect(() => {
    const savedBookmarks = JSON.parse(localStorage.getItem('publicFinderBookmarks') || '[]');
    setBookmarks(savedBookmarks);
  }, []);

  const removeBookmark = (index) => {
    const newBookmarks = bookmarks.filter((_, i) => i !== index);
    setBookmarks(newBookmarks);
    localStorage.setItem('publicFinderBookmarks', JSON.stringify(newBookmarks));
  };

  const clearAllBookmarks = () => {
    setBookmarks([]);
    localStorage.removeItem('publicFinderBookmarks');
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getSearchSummary = (searchParams) => {
    const parts = [];
    
    if (searchParams.location) {
      parts.push(`📍 ${searchParams.location}`);
    }
    if (searchParams.bodyPart) {
      parts.push(`🔬 ${searchParams.bodyPart}`);
    }
    if (searchParams.modalities?.length > 0) {
      parts.push(`📊 ${searchParams.modalities.join(', ')}`);
    }
    
    return parts.length > 0 ? parts.join(' • ') : 'All centers';
  };

  if (bookmarks.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            title="View bookmarked searches"
          >
            <Bookmark className="h-4 w-4" />
            Bookmarks
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5" />
              Bookmarked Searches
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 text-muted-foreground">
            <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium">No bookmarks yet</p>
            <p className="text-sm">Save searches to find them here later</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 relative"
          title="View bookmarked searches"
        >
          <Bookmark className="h-4 w-4" />
          Bookmarks
          <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
            {bookmarks.length}
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bookmark className="h-5 w-5" />
              Bookmarked Searches ({bookmarks.length})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllBookmarks}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-3">
          {bookmarks.map((bookmark, index) => (
            <div 
              key={index}
              className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">
                      {getSearchSummary(bookmark.searchParams)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(bookmark.timestamp)}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {bookmark.resultCount} centers
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {bookmark.searchParams.location && (
                      <Badge variant="outline" className="text-xs">
                        📍 {bookmark.searchParams.location}
                      </Badge>
                    )}
                    {bookmark.searchParams.bodyPart && (
                      <Badge variant="outline" className="text-xs">
                        🔬 {bookmark.searchParams.bodyPart}
                      </Badge>
                    )}
                    {bookmark.searchParams.modalities?.map((modality, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        📊 {modality}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      onRestoreSearch(bookmark.searchParams);
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-1"
                  >
                    <Search className="h-3 w-3" />
                    Restore
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBookmark(index)}
                    className="text-destructive hover:text-destructive h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
