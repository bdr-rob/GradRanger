import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Share2, Twitter, Facebook, Linkedin, Copy, Trophy, TrendingUp, Star, Award, Target, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PortfolioItem {
  id: string;
  player_name: string;
  year: string;
  set_name: string;
  card_number: string;
  grade?: string;
  grading_company?: string;
  purchase_price: number;
  current_value: number;
  purchase_date: string;
  image_url?: string;
}

interface SocialSharingProps {
  portfolioItems: PortfolioItem[];
  totalValue: number;
  totalGain: number;
}

const SocialSharing: React.FC<SocialSharingProps> = ({ portfolioItems, totalValue, totalGain }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  const achievements = [
    { id: 1, name: 'First Grail', icon: Trophy, unlocked: portfolioItems.length > 0, color: 'text-yellow-500' },
    { id: 2, name: 'Profit Master', icon: TrendingUp, unlocked: totalGain > 100, color: 'text-green-500' },
    { id: 3, name: 'Collector', icon: Star, unlocked: portfolioItems.length >= 10, color: 'text-blue-500' },
    { id: 4, name: 'Big Spender', icon: Award, unlocked: totalValue > 1000, color: 'text-purple-500' },
    { id: 5, name: 'Sharp Eye', icon: Target, unlocked: totalGain > 500, color: 'text-red-500' },
    { id: 6, name: 'Power Trader', icon: Zap, unlocked: portfolioItems.length >= 25, color: 'text-orange-500' }
  ];

  const topPerformers = [...portfolioItems]
    .sort((a, b) => (b.current_value - b.purchase_price) - (a.current_value - a.purchase_price))
    .slice(0, 5);

  const templates = {
    modern: {
      name: 'Modern Showcase',
      bgColor: 'bg-gradient-to-br from-blue-600 to-purple-600',
      textColor: 'text-white'
    },
    classic: {
      name: 'Classic Collection',
      bgColor: 'bg-gradient-to-br from-gray-800 to-gray-900',
      textColor: 'text-white'
    },
    vibrant: {
      name: 'Vibrant Display',
      bgColor: 'bg-gradient-to-br from-pink-500 to-orange-500',
      textColor: 'text-white'
    }
  };

  const generateShareText = (type: string) => {
    switch(type) {
      case 'portfolio':
        return `📈 My Sports Card Portfolio:\n💰 Total Value: $${totalValue.toFixed(2)}\n📊 Total Gain: ${totalGain >= 0 ? '+' : ''}$${totalGain.toFixed(2)}\n🏆 ${portfolioItems.length} Cards\n\n#SportsCards #CardCollector #TheHobby`;
      case 'top':
        const top = topPerformers[0];
        if (!top) return '';
        const gain = top.current_value - top.purchase_price;
        return `🔥 Top Performer Alert!\n${top.player_name} ${top.year} ${top.set_name}\n💎 Grade: ${top.grade || 'Raw'}\n📈 Gain: +$${gain.toFixed(2)}\n\n#SportsCards #Investment`;
      case 'achievement':
        const unlocked = achievements.filter(a => a.unlocked);
        return `🏆 Achievement Unlocked!\n${unlocked.map(a => `✅ ${a.name}`).join('\n')}\n\n#CardCollector #Achievements`;
      default:
        return '';
    }
  };

  const shareToSocial = (platform: string, text: string) => {
    const encodedText = encodeURIComponent(text);
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}&quote=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Share text copied to clipboard"
    });
  };

  const toggleCardSelection = (cardId: string) => {
    setSelectedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Social Sharing Hub
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="showcase">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="showcase">Card Showcase</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="summary">Portfolio Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="showcase" className="space-y-4">
            <div className="flex gap-4">
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(templates).map(([key, template]) => (
                    <SelectItem key={key} value={key}>{template.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={`p-6 rounded-lg ${templates[selectedTemplate].bgColor} ${templates[selectedTemplate].textColor}`}>
              <h3 className="text-2xl font-bold mb-4">My Top Performers 🔥</h3>
              <div className="grid gap-3">
                {topPerformers.slice(0, 3).map((card, idx) => (
                  <div key={card.id} className="bg-white/10 backdrop-blur p-3 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">#{idx + 1} {card.player_name}</div>
                        <div className="text-sm opacity-90">{card.year} {card.set_name}</div>
                        {card.grade && (
                          <Badge className="mt-1" variant="secondary">
                            {card.grading_company} {card.grade}
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">+${(card.current_value - card.purchase_price).toFixed(2)}</div>
                        <div className="text-sm opacity-90">
                          {((card.current_value - card.purchase_price) / card.purchase_price * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => shareToSocial('twitter', generateShareText('top'))} className="flex-1">
                <Twitter className="h-4 w-4 mr-2" /> Share
              </Button>
              <Button onClick={() => shareToSocial('facebook', generateShareText('top'))} className="flex-1">
                <Facebook className="h-4 w-4 mr-2" /> Share
              </Button>
              <Button onClick={() => copyToClipboard(generateShareText('top'))} variant="outline">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {achievements.map(achievement => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      achievement.unlocked 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-200 bg-gray-50 opacity-50'
                    }`}
                  >
                    <Icon className={`h-8 w-8 mx-auto mb-2 ${achievement.unlocked ? achievement.color : 'text-gray-400'}`} />
                    <div className="font-semibold text-sm">{achievement.name}</div>
                    <Badge variant={achievement.unlocked ? "default" : "secondary"} className="mt-2">
                      {achievement.unlocked ? 'Unlocked' : 'Locked'}
                    </Badge>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <Button onClick={() => shareToSocial('twitter', generateShareText('achievement'))} className="flex-1">
                <Twitter className="h-4 w-4 mr-2" /> Share Achievements
              </Button>
              <Button onClick={() => copyToClipboard(generateShareText('achievement'))} variant="outline">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Portfolio Snapshot 📊</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-3xl font-bold">${totalValue.toFixed(2)}</div>
                  <div className="text-sm opacity-90">Total Value</div>
                </div>
                <div>
                  <div className={`text-3xl font-bold ${totalGain >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {totalGain >= 0 ? '+' : ''}${totalGain.toFixed(2)}
                  </div>
                  <div className="text-sm opacity-90">Total Gain/Loss</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{portfolioItems.length}</div>
                  <div className="text-sm opacity-90">Total Cards</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">
                    {totalValue > 0 ? ((totalGain / totalValue) * 100).toFixed(1) : '0'}%
                  </div>
                  <div className="text-sm opacity-90">ROI</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => shareToSocial('twitter', generateShareText('portfolio'))} className="flex-1">
                <Twitter className="h-4 w-4 mr-2" /> Share
              </Button>
              <Button onClick={() => shareToSocial('linkedin', generateShareText('portfolio'))} className="flex-1">
                <Linkedin className="h-4 w-4 mr-2" /> Share
              </Button>
              <Button onClick={() => copyToClipboard(generateShareText('portfolio'))} variant="outline">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SocialSharing;