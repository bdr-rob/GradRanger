import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Bell, Plus, Trash2, Clock, RefreshCw, TrendingDown, TrendingUp, Edit, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface PriceAlert {
  id: string;
  card_name: string;
  target_price: number;
  marketplace: string;
  alert_type: 'below' | 'above';
  is_active: boolean;
  last_checked?: string;
  last_triggered?: string;
  notification_count?: number;
}

export default function PriceAlerts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    card_name: '',
    target_price: '',
    marketplace: 'all',
    alert_type: 'below' as 'below' | 'above'
  });

  useEffect(() => {
    if (user) fetchAlerts();
  }, [user]);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('price_alerts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch alerts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const checkAlerts = async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-price-alerts');
      if (error) throw error;
      toast({ 
        title: "Alerts Checked", 
        description: `Checked ${data.alertsChecked} alerts, sent ${data.notificationsSent} notifications` 
      });
      fetchAlerts();
    } catch (error) {
      toast({ title: "Error", description: "Failed to check alerts", variant: "destructive" });
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    try {
      const { error } = await supabase.from('price_alerts').insert([{
        user_id: user.id,
        card_name: formData.card_name,
        target_price: parseFloat(formData.target_price),
        marketplace: formData.marketplace,
        alert_type: formData.alert_type
      }]);
      if (error) throw error;
      toast({ title: "Success", description: "Price alert created" });
      setIsDialogOpen(false);
      setFormData({ card_name: '', target_price: '', marketplace: 'all', alert_type: 'below' });
      fetchAlerts();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create alert", variant: "destructive" });
    }
  };

  const toggleAlert = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('price_alerts')
        .update({ is_active: !isActive })
        .eq('id', id);
      if (error) throw error;
      fetchAlerts();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update alert", variant: "destructive" });
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      const { error } = await supabase.from('price_alerts').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Success", description: "Alert deleted" });
      fetchAlerts();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete alert", variant: "destructive" });
    }
  };

  if (!user) return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-center text-gray-500">Please log in to manage price alerts</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-[#47682d]" />
              <div>
                <CardTitle>Price Alerts</CardTitle>
                <CardDescription>Get email notifications when cards reach your target price</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={checkAlerts} disabled={checking} variant="outline">
                <RefreshCw className={`w-4 h-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
                Check Now
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#47682d] hover:bg-[#47682d]/90">
                    <Plus className="w-4 h-4 mr-2" />
                    New Alert
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Price Alert</DialogTitle>
                    <DialogDescription>Get notified when a card reaches your target price</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Card Name</Label>
                      <Input
                        value={formData.card_name}
                        onChange={(e) => setFormData({ ...formData, card_name: e.target.value })}
                        placeholder="e.g., 2023 Bowman Chrome Wembanyama RC"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Target Price ($)</Label>
                        <Input
                          type="number"
                          value={formData.target_price}
                          onChange={(e) => setFormData({ ...formData, target_price: e.target.value })}
                          placeholder="100.00"
                        />
                      </div>
                      <div>
                        <Label>Alert When</Label>
                        <Select value={formData.alert_type} onValueChange={(v) => setFormData({ ...formData, alert_type: v as 'below' | 'above' })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="below">Below Target</SelectItem>
                            <SelectItem value="above">Above Target</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Marketplace</Label>
                      <Select value={formData.marketplace} onValueChange={(v) => setFormData({ ...formData, marketplace: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Marketplaces</SelectItem>
                          <SelectItem value="ebay">eBay</SelectItem>
                          <SelectItem value="goldin">Goldin Auctions</SelectItem>
                          <SelectItem value="pwcc">PWCC Marketplace</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} className="bg-[#47682d] hover:bg-[#47682d]/90">Create Alert</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#47682d]" />
            </div>
          ) : alerts.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No price alerts set up yet</p>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{alert.card_name}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          {alert.alert_type === 'below' ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                          Alert when {alert.alert_type} ${alert.target_price}
                        </span>
                        <span>{alert.marketplace === 'all' ? 'All Marketplaces' : alert.marketplace.toUpperCase()}</span>
                      </div>
                      {alert.last_triggered && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-green-600">
                          <Clock className="w-3 h-3" />
                          Last triggered: {new Date(alert.last_triggered).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={alert.is_active}
                        onCheckedChange={() => toggleAlert(alert.id, alert.is_active)}
                      />
                      <Button variant="ghost" size="icon" onClick={() => deleteAlert(alert.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}