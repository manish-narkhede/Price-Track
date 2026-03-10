'use client';

import { useState, FormEvent } from 'react';
import { Bell, BellOff, Loader2, Trash2 } from 'lucide-react';
import { setAlert, deleteAlert } from '@/lib/api';

interface AlertFormProps {
  productId: string;
  currentPrice: number;
  existingAlertPrice: number | null;
  alertEnabled: boolean;
  onAlertChange: (price: number | null, enabled: boolean) => void;
}

function formatPrice(price: number) {
  return `₹${price.toLocaleString('en-IN')}`;
}

export default function AlertForm({
  productId,
  currentPrice,
  existingAlertPrice,
  alertEnabled,
  onAlertChange,
}: AlertFormProps) {
  const [priceInput, setPriceInput] = useState(
    existingAlertPrice ? String(existingAlertPrice) : ''
  );
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSet = async (e: FormEvent) => {
    e.preventDefault();
    const price = parseFloat(priceInput);
    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid price.');
      return;
    }
    if (price >= currentPrice) {
      setError(`Alert price must be below current price (${formatPrice(currentPrice)}).`);
      return;
    }
    setError('');
    setSaving(true);
    try {
      await setAlert(productId, price);
      onAlertChange(price, true);
      setMessage(`Alert set! We'll notify you when the price drops to ${formatPrice(price)} or below.`);
    } catch {
      setError('Failed to save alert. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setError('');
    setMessage('');
    setRemoving(true);
    try {
      await deleteAlert(productId);
      onAlertChange(null, false);
      setPriceInput('');
      setMessage('Alert removed.');
    } catch {
      setError('Failed to remove alert.');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div>
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Bell size={16} className="text-blue-600" />
        Price Drop Alert
      </h3>

      {message && (
        <p className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          {message}
        </p>
      )}
      {error && (
        <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <form onSubmit={handleSet} className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
            ₹
          </span>
          <input
            type="number"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            placeholder="Target price"
            min={1}
            step={1}
            required
            className="input pl-7 text-sm"
          />
        </div>
        <button type="submit" disabled={saving || removing} className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Bell size={14} />}
          {alertEnabled ? 'Update' : 'Set Alert'}
        </button>
      </form>

      {alertEnabled && existingAlertPrice && (
        <div className="mt-3 flex items-center justify-between text-sm text-gray-600 bg-blue-50 rounded-lg px-3 py-2">
          <span className="flex items-center gap-1.5">
            <Bell size={13} className="text-blue-600" />
            Alert: {formatPrice(existingAlertPrice)}
          </span>
          <button
            onClick={handleRemove}
            disabled={removing}
            className="text-red-500 hover:text-red-700 flex items-center gap-1 text-xs"
          >
            {removing ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Trash2 size={12} />
            )}
            Remove
          </button>
        </div>
      )}

      {!alertEnabled && (
        <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
          <BellOff size={11} />
          No active alert — enter a target price above
        </p>
      )}
    </div>
  );
}
