import React, { useState } from 'react';
import { Button } from '../ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '../ui/dropdown-menu';
import { 
  Share2, 
  Copy, 
  Mail, 
  Bookmark, 
  Check,
  ExternalLink
} from 'lucide-react';
import { generatePublicFinderURL } from '../../lib/deepLinking';

export function ShareDropdown({ searchParams, searchResults, onBookmark }) {
  const [copied, setCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleCopyLink = async () => {
    const url = generatePublicFinderURL(searchParams);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEmailShare = () => {
    const url = generatePublicFinderURL(searchParams);
    const subject = 'Imaging Centers Search Results';
    
    let body = 'I found some imaging centers that might be helpful:\n\n';
    if (searchParams.location) {
      body += `Location: ${searchParams.location}\n`;
    }
    if (searchParams.bodyPart) {
      body += `Body Part: ${searchParams.bodyPart}\n`;
    }
    if (searchParams.modalities?.length > 0) {
      body += `Modalities: ${searchParams.modalities.join(', ')}\n`;
    }
    body += `\nResults: ${searchResults.length} centers found\n\n`;
    body += `View the full results here: ${url}`;

    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  const handleBookmark = () => {
    const url = generatePublicFinderURL(searchParams);
    const bookmarkData = {
      url,
      searchParams,
      timestamp: new Date().toISOString(),
      resultCount: searchResults.length
    };

    // Get existing bookmarks
    const existingBookmarks = JSON.parse(localStorage.getItem('publicFinderBookmarks') || '[]');
    
    // Check if this search is already bookmarked
    const existingIndex = existingBookmarks.findIndex(bookmark => 
      bookmark.url === url
    );

    if (existingIndex >= 0) {
      // Remove existing bookmark
      existingBookmarks.splice(existingIndex, 1);
      setIsBookmarked(false);
    } else {
      // Add new bookmark
      existingBookmarks.push(bookmarkData);
      setIsBookmarked(true);
    }

    // Save to localStorage
    localStorage.setItem('publicFinderBookmarks', JSON.stringify(existingBookmarks));
    
    // Notify parent component
    if (onBookmark) {
      onBookmark(bookmarkData, !isBookmarked);
    }
  };

  const handleWebShare = async () => {
    const url = generatePublicFinderURL(searchParams);
    const title = 'Imaging Centers Search Results';
    
    let text = 'Found imaging centers';
    if (searchParams.location) {
      text += ` in ${searchParams.location}`;
    }
    if (searchParams.bodyPart) {
      text += ` for ${searchParams.bodyPart}`;
    }
    text += ` (${searchResults.length} results)`;

    try {
      await navigator.share({
        title,
        text,
        url
      });
    } catch (error) {
      console.log('Web Share API failed:', error);
      // Fallback to copy link
      handleCopyLink();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          title="Share search results"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
          Share Search Results
        </div>
        <DropdownMenuSeparator />
        
        {/* Copy Link */}
        <DropdownMenuItem onClick={handleCopyLink}>
          <Copy className="mr-2 h-4 w-4" />
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4 text-green-600" />
              Copied!
            </>
          ) : (
            'Copy Link'
          )}
        </DropdownMenuItem>

        {/* Email Share */}
        <DropdownMenuItem onClick={handleEmailShare}>
          <Mail className="mr-2 h-4 w-4" />
          Share via Email
        </DropdownMenuItem>

        {/* Web Share API (if available) */}
        {navigator.share && (
          <DropdownMenuItem onClick={handleWebShare}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Share via System
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Bookmark */}
        <DropdownMenuItem onClick={handleBookmark}>
          <Bookmark className={`mr-2 h-4 w-4 ${isBookmarked ? 'text-blue-600 fill-current' : ''}`} />
          {isBookmarked ? 'Remove Bookmark' : 'Bookmark Search'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
