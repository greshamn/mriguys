import React, { useMemo, useState } from 'react';
import { useRole } from '../context/RoleContext';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Search, Send, Inbox, Star, Archive, Trash2, Hash, Tag } from 'lucide-react';

function roleSeed(viewingAsRole) {
  if (viewingAsRole === 'referrer') {
    return {
      folders: [
        { id: 'inbox', label: 'Inbox', count: 12, icon: Inbox },
        { id: 'important', label: 'Important', count: 3, icon: Star },
        { id: 'archive', label: 'Archive', count: 4, icon: Archive },
        { id: 'trash', label: 'Trash', count: 1, icon: Trash2 }
      ],
      threads: [
        {
          id: 't1',
          from: 'Imaging Center – Downtown',
          subject: 'Report ready for John Doe',
          tags: ['work', 'important'],
          preview: 'MRI lumbar spine results finalized. Please review impression...',
          time: '2h ago',
          body: `Hello,

The MRI report for John Doe is finalized and attached to the case. Impression notes highlight mild disc bulge at L4-L5.

Let us know if you need an expedited radiologist consult.

– Downtown Imaging`
        },
        {
          id: 't2',
          from: 'Sarah Chen (Patient)',
          subject: 'Prep questions for the scan',
          tags: ['patient'],
          preview: 'Do I need to stop eating before the CT? Also is parking available...',
          time: 'yesterday',
          body: `Hi,

Do I need to fast before my CT scan on Friday? Is there parking validation at the center?

Thanks,
Sarah`
        }
      ]
    };
  }

  // default: patient view
  return {
    folders: [
      { id: 'inbox', label: 'Inbox', count: 5, icon: Inbox },
      { id: 'updates', label: 'Updates', count: 2, icon: Hash },
      { id: 'archive', label: 'Archive', count: 1, icon: Archive }
    ],
    threads: [
      {
        id: 'p1',
        from: 'Miami Beach Imaging Center',
        subject: 'Preparation Reminder',
        tags: ['appointment'],
        preview: 'Please arrive 15 minutes early and remove all metal objects...',
        time: 'today',
        body: `Hello,

This is a reminder for tomorrow's MRI at 4:00 PM. Please arrive 15 minutes early and remove all metal objects. Bring your ID and insurance card.

– Miami Beach Imaging Center`
      },
      {
        id: 'p2',
        from: 'Radiology Team',
        subject: 'Results Available',
        tags: ['results', 'important'],
        preview: 'Your MRI results are now available in the portal...',
        time: '2d ago',
        body: `Hi,

Your MRI report is available. You can view or download it from the Results page.

– Radiology`
      }
    ]
  };
}

export default function Messages() {
  const { viewingAsRole } = useRole();
  const seed = useMemo(() => roleSeed(viewingAsRole), [viewingAsRole]);
  const [query, setQuery] = useState('');
  const [activeFolder, setActiveFolder] = useState(seed.folders[0].id);
  const [selectedId, setSelectedId] = useState(seed.threads[0]?.id);

  const filteredThreads = seed.threads.filter(t =>
    [t.from, t.subject, t.preview].join(' ').toLowerCase().includes(query.toLowerCase())
  );
  const selected = filteredThreads.find(t => t.id === selectedId) || filteredThreads[0];

  return (
    <div className="col-span-12 grid grid-cols-12 gap-4">
      {/* Left rail: folders */}
      <Card className="col-span-12 md:col-span-3 p-3 h-[80vh] overflow-y-auto">
        <div className="space-y-1">
          {seed.folders.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFolder(f.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                activeFolder === f.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-card-foreground'
              }`}
            >
              <span className="flex items-center gap-2"><f.icon className="w-4 h-4" />{f.label}</span>
              <Badge variant={activeFolder === f.id ? 'secondary' : 'outline'}>{f.count}</Badge>
            </button>
          ))}
        </div>
      </Card>

      {/* Middle: thread list */}
      <Card className="col-span-12 md:col-span-4 p-0 h-[80vh] overflow-hidden">
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="pl-9" />
          </div>
        </div>
        <div className="h-[calc(80vh-56px)] overflow-y-auto divide-y divide-border">
          {filteredThreads.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedId(t.id)}
              className={`w-full text-left p-3 hover:bg-accent ${selected?.id === t.id ? 'bg-accent' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium text-card-foreground truncate mr-2">{t.from}</div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">{t.time}</div>
              </div>
              <div className="text-sm text-card-foreground truncate">{t.subject}</div>
              <div className="text-xs text-muted-foreground truncate mt-0.5">{t.preview}</div>
              <div className="flex gap-1 mt-2">
                {t.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-[10px] capitalize">
                    <Tag className="w-3 h-3 mr-1" />{tag}
                  </Badge>
                ))}
              </div>
            </button>
          ))}
          {filteredThreads.length === 0 && (
            <div className="p-6 text-sm text-muted-foreground">No messages found.</div>
          )}
        </div>
      </Card>

      {/* Right: message view */}
      <Card className="col-span-12 md:col-span-5 p-0 h-[80vh] overflow-hidden">
        {selected ? (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border">
              <div className="text-sm text-muted-foreground">{selected.from}</div>
              <div className="text-lg font-semibold text-card-foreground">{selected.subject}</div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 whitespace-pre-line text-sm leading-relaxed">
              {selected.body}
            </div>
            <Separator />
            <div className="p-3 flex items-center gap-2">
              <Input placeholder={`Reply ${selected.from.split(' ')[0]}...`} />
              <Button>
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Select a message</div>
        )}
      </Card>
    </div>
  );
}


