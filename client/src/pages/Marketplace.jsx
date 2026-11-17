import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  MapPin,
  Wheat,
  X,
  Check,
  Ban,
  ShoppingBag,
  RefreshCw,
} from 'lucide-react';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  const backendOrigin = new URL(api.defaults.baseURL).origin;
  if (/^https?:\/\/localhost:\d+/i.test(imageUrl)) {
    return imageUrl.replace(
      /^https?:\/\/localhost:\d+/i,
      backendOrigin
    );
  }
  if (imageUrl.startsWith('/uploads/')) {
    return `${backendOrigin}${imageUrl}`;
  }
  return imageUrl;
};

const empty = {
  cropName: '',
  quantity: '',
  unit: 'kg',
  expectedPrice: '',
  state: '',
  district: '',
  harvestDate: '',
  description: '',
  qualityGrade: '',
  contactPhone: '',
};

function Money({ v }) {
  return (
    <span>
      ₹{Number(v || 0).toLocaleString('en-IN')}
    </span>
  );
}

export default function Marketplace() {
  const { user } = useAuth();

  const [tab, setTab] = useState('browse');
  const [items, setItems] = useState([]);
  const [offers, setOffers] = useState([]);
  const [tx, setTx] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    q: '',
    crop: '',
    state: '',
    minPrice: '',
    maxPrice: '',
  });

  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    setLoading(true);

    try {
      const response = await api.get('/listings', {
        params: filters,
      });

      setItems(response.data);
    } catch (e) {
      toast.error(
        e.response?.data?.message ||
          'Could not load marketplace'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadActivity = async () => {
    if (!user) return;

    try {
      const [offersResponse, transactionsResponse] =
        await Promise.all([
          api.get('/offers/my'),
          api.get('/transactions'),
        ]);

      setOffers(offersResponse.data);
      setTx(transactionsResponse.data);
    } catch (e) {
      toast.error(
        'Could not load your marketplace activity'
      );
    }
  };

  useEffect(() => {
  load();
}, []);

useEffect(() => {
  if (user) {
    loadActivity();
  }
}, [user]);

  const activeItems = useMemo(() => items, [items]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">

      {/* Header */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="font-semibold text-emerald-700">
            DIRECT FARMER MARKETPLACE
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Buy and sell crops directly
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            Discover fresh produce, compare farmer offers and
            negotiate without a built-in payment processor.
          </p>
        </div>

        {user?.role === 'farmer' && (
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white"
          >
            <Plus size={18} />
            List a crop
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mt-8 rounded-2xl border bg-white p-4 shadow-sm">

        <div className="grid gap-3 md:grid-cols-5">

          <label className="relative md:col-span-2">
            <Search
              className="absolute left-3 top-3 text-slate-400"
              size={18}
            />

            <input
              value={filters.q}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  q: e.target.value,
                })
              }
              placeholder="Search crop or description"
              className="w-full rounded-xl border py-2.5 pl-10 pr-3"
            />
          </label>

          <input
            value={filters.crop}
            onChange={(e) =>
              setFilters({
                ...filters,
                crop: e.target.value,
              })
            }
            placeholder="Crop"
            className="rounded-xl border px-3 py-2.5"
          />

          <input
            value={filters.state}
            onChange={(e) =>
              setFilters({
                ...filters,
                state: e.target.value,
              })
            }
            placeholder="State"
            className="rounded-xl border px-3 py-2.5"
          />

          <button
            onClick={load}
            className="rounded-xl bg-slate-950 px-4 py-2.5 font-bold text-white"
          >
            <RefreshCw
              size={17}
              className="mr-2 inline"
            />
            Search
          </button>

        </div>

        <div className="mt-3 flex flex-wrap gap-2">

          <input
            value={filters.minPrice}
            onChange={(e) =>
              setFilters({
                ...filters,
                minPrice: e.target.value,
              })
            }
            type="number"
            placeholder="Min price"
            className="w-32 rounded-lg border px-3 py-2 text-sm"
          />

          <input
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters({
                ...filters,
                maxPrice: e.target.value,
              })
            }
            type="number"
            placeholder="Max price"
            className="w-32 rounded-lg border px-3 py-2 text-sm"
          />

        </div>
      </div>

      {/* Tabs */}
      {user && (
        <div className="mt-6 flex gap-2 overflow-auto">

          <button
            onClick={() => setTab('browse')}
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              tab === 'browse'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100'
            }`}
          >
            Browse
          </button>

          <button
            onClick={() => {
              setTab('offers');
              loadActivity();
            }}
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              tab === 'offers'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100'
            }`}
          >
            My Offers
          </button>

          <button
            onClick={() => {
              setTab('transactions');
              loadActivity();
            }}
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              tab === 'transactions'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100'
            }`}
          >
            Transactions
          </button>

        </div>
      )}

      {/* Content */}
      {tab === 'browse' ? (
        <>
          {loading ? (
            <div className="py-16 text-center text-slate-500">
              Loading listings…
            </div>
          ) : activeItems.length === 0 ? (
            <div className="mt-8 rounded-2xl border bg-white p-12 text-center">

              <ShoppingBag
                className="mx-auto text-slate-300"
                size={40}
              />

              <h2 className="mt-4 text-xl font-bold">
                No active listings found
              </h2>

              <p className="mt-2 text-slate-500">
                Try a different search or check back later.
              </p>

            </div>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {activeItems.map((item) => (
                <ListingCard
                  key={item._id}
                  item={item}
                  user={user}
                  onView={() => setSelected(item)}
                />
              ))}

            </div>
          )}
        </>
      ) : tab === 'offers' ? (
        <Offers
          offers={offers}
          user={user}
          onRefresh={loadActivity}
        />
      ) : (
        <Transactions tx={tx} />
      )}

      {/* Offer Modal */}
      {selected && (
        <OfferModal
          item={selected}
          user={user}
          onClose={() => setSelected(null)}
          onDone={() => {
            setSelected(null);
            load();
            loadActivity();
          }}
        />
      )}

      {/* Create Listing Modal */}
      {showCreate && (
        <CreateListing
          onClose={() => setShowCreate(false)}
          onDone={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}

    </main>
  );
}


/* =========================
   LISTING CARD
========================= */

function ListingCard({ item, user, onView }) {
  return (
    <article className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

      {item.imageUrl ? (
        <img
          src={getImageUrl(item.imageUrl)}
          alt={item.cropName}
          className="h-44 w-full object-cover"
        />
      ) : (
        <div className="grid h-44 place-items-center bg-emerald-50">
          <Wheat
            size={44}
            className="text-emerald-300"
          />
        </div>
      )}

      <div className="p-5">

        <div className="flex items-start justify-between gap-3">

          <h2 className="text-xl font-black">
            {item.cropName}
          </h2>

          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
            {item.qualityGrade || 'Standard'}
          </span>

        </div>

        <p className="mt-2 text-sm text-slate-500">
          {item.quantity} {item.unit} · expected{' '}
          <Money v={item.expectedPrice} />
        </p>

        <p className="mt-3 flex items-center gap-1 text-sm text-slate-500">
          <MapPin size={15} />
          {item.location?.district},{' '}
          {item.location?.state}
        </p>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
          {item.description ||
            'Farmer-listed agricultural produce.'}
        </p>

        <div className="mt-5 flex items-center justify-between">

          <span className="text-sm text-slate-500">
            By {item.farmer?.name || 'Farmer'}
          </span>

          <button
            onClick={onView}
            className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white"
          >
            View & offer
          </button>

        </div>

      </div>
    </article>
  );
}


/* =========================
   OFFER MODAL
========================= */

function OfferModal({
  item,
  user,
  onClose,
  onDone,
}) {
  const [price, setPrice] = useState(
    item.expectedPrice
  );

  const [qty, setQty] = useState(
    item.quantity
  );

  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {

    if (!user) {
      return toast.error(
        'Login as a buyer to submit an offer'
      );
    }

    setSaving(true);

    try {
      await api.post('/offers', {
        listing: item._id,
        offeredPrice: Number(price),
        quantity: Number(qty),
        message,
      });

      toast.success('Offer submitted');

      onDone();

    } catch (e) {
      toast.error(
        e.response?.data?.message ||
          'Offer failed'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={item.cropName}
      onClose={onClose}
    >

      {item.imageUrl && (
        <img
          src={getImageUrl(item.imageUrl)}
          alt={item.cropName}
          className="mb-5 h-48 w-full rounded-xl object-cover"
        />
      )}

      <div className="grid grid-cols-2 gap-3 text-sm">

        <div className="rounded-xl bg-slate-50 p-3">
          <b>
            {item.quantity} {item.unit}
          </b>
          <br />
          available
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <b>
            <Money v={item.expectedPrice} />
          </b>
          <br />
          expected price
        </div>

      </div>

      <p className="mt-4 text-sm text-slate-600">
        Farmer:{' '}
        <b>{item.farmer?.name}</b> ·{' '}
        {item.location?.district},{' '}
        {item.location?.state}
      </p>

      {user?.role === 'buyer' ? (
        <div className="mt-5 space-y-3">

          <input
            type="number"
            min="0"
            value={price}
            onChange={(e) =>
              setPrice(e.target.value)
            }
            placeholder="Offered price per unit"
            className="w-full rounded-xl border px-3 py-3"
          />

          <input
            type="number"
            min="0.01"
            max={item.quantity}
            value={qty}
            onChange={(e) =>
              setQty(e.target.value)
            }
            placeholder="Quantity"
            className="w-full rounded-xl border px-3 py-3"
          />

          <textarea
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            placeholder="Message to farmer (optional)"
            className="min-h-24 w-full rounded-xl border px-3 py-3"
          />

          <button
            disabled={saving}
            onClick={submit}
            className="w-full rounded-xl bg-emerald-700 py-3 font-bold text-white disabled:opacity-50"
          >
            {saving
              ? 'Submitting…'
              : 'Submit offer'}
          </button>

        </div>
      ) : (
        <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          Login as a buyer to negotiate on this listing.
        </div>
      )}

    </Modal>
  );
}


/* =========================
   OFFERS
========================= */

function Offers({
  offers,
  user,
  onRefresh,
}) {
  const mine = offers;

  return (
    <div className="mt-8 space-y-3">

      {mine.length === 0 ? (
        <Empty title="No offers yet" />
      ) : (
        mine.map((offer) => (
          <div
            key={offer._id}
            className="rounded-2xl border bg-white p-5"
          >

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

              <div>

                <h3 className="font-black">
                  {offer.listing?.cropName}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {user.role === 'farmer'
                    ? 'From'
                    : 'To'}{' '}
                  {user.role === 'farmer'
                    ? offer.buyer?.name
                    : offer.farmer?.name}{' '}
                  · {offer.quantity}{' '}
                  {offer.listing?.unit}
                </p>

                <p className="mt-1 font-bold">
                  <Money
                    v={offer.offeredPrice}
                  />{' '}
                  / unit ·{' '}
                  <span className="capitalize">
                    {offer.status}
                  </span>
                </p>

              </div>

              {user.role === 'farmer' &&
                offer.status === 'pending' && (
                  <div className="flex gap-2">

                    <button
                      onClick={async () => {
                        try {
                          await api.patch(
                            `/offers/${offer._id}/accept`
                          );

                          toast.success(
                            'Offer accepted and listing reserved'
                          );

                          onRefresh();

                        } catch (e) {
                          toast.error(
                            e.response?.data?.message ||
                              'Could not accept'
                          );
                        }
                      }}
                      className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white"
                    >
                      <Check
                        size={16}
                        className="mr-1 inline"
                      />
                      Accept
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          await api.patch(
                            `/offers/${offer._id}/reject`
                          );

                          toast.success(
                            'Offer rejected'
                          );

                          onRefresh();

                        } catch (e) {
                          toast.error(
                            e.response?.data?.message ||
                              'Could not reject'
                          );
                        }
                      }}
                      className="rounded-xl border px-4 py-2 text-sm font-bold"
                    >
                      <Ban
                        size={16}
                        className="mr-1 inline"
                      />
                      Reject
                    </button>

                  </div>
                )}

            </div>

            {offer.message && (
              <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                {offer.message}
              </p>
            )}

          </div>
        ))
      )}

    </div>
  );
}


/* =========================
   TRANSACTIONS
========================= */
function Transactions({ tx }) {
  const { user } = useAuth();
  const [payingId, setPayingId] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);

  const handlePayment = async (transactionId) => {
    try {
      setPayingId(transactionId);

      await api.patch(`/transactions/${transactionId}/payment`);

      toast.success('Payment submitted. Waiting for farmer confirmation.');

      window.location.reload();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        'Unable to submit payment'
      );
    } finally {
      setPayingId(null);
    }
  };

  const handleConfirmPayment = async (transactionId) => {
    try {
      setConfirmingId(transactionId);

      await api.patch(
        `/transactions/${transactionId}/payment/confirm`
      );

      toast.success('Payment received and confirmed.');

      window.location.reload();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        'Unable to confirm payment'
      );
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div className="mt-8 space-y-4">
      {tx.length === 0 ? (
        <Empty title="No transactions yet" />
      ) : (
        tx.map((transaction) => {
          const isFarmer = user?.role === 'farmer';

          const otherPerson = isFarmer
            ? transaction.buyer
            : transaction.farmer;

          const otherPersonRole = isFarmer
            ? 'Buyer'
            : 'Farmer';

          const paymentStatus =
            transaction.paymentStatus || 'pending';

          const paymentPending =
            paymentStatus === 'pending';

          const buyerMarkedPaid =
            paymentStatus === 'buyer_marked_paid';

          const paymentPaid =
            paymentStatus === 'paid';

          return (
            <div
              key={transaction._id}
              className="rounded-2xl border bg-white p-6 shadow-sm"
            >

              {/* Header */}
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                    ✓ Deal Confirmed
                  </span>

                  <h3 className="mt-3 text-2xl font-black">
                    {transaction.listing?.cropName}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {transaction.quantity}{' '}
                    {transaction.listing?.unit}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xl font-black">
                    <Money v={transaction.amount} />
                  </p>

                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                    {transaction.status}
                  </p>
                </div>
              </div>


              {/* Other Person Details */}
              <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {otherPersonRole} Details
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">

                  <div>
                    <p className="text-xs text-slate-500">
                      Name
                    </p>

                    <p className="mt-1 font-bold">
                      {otherPerson?.name || 'Not available'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Phone
                    </p>

                    {otherPerson?.phone ? (
                      <a
                        href={`tel:${otherPerson.phone}`}
                        className="mt-1 inline-block font-bold text-emerald-700 hover:underline"
                      >
                        📞 {otherPerson.phone}
                      </a>
                    ) : (
                      <p className="mt-1 font-bold">
                        Not available
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      State
                    </p>

                    <p className="mt-1 font-semibold">
                      {otherPerson?.state || 'Not available'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      District
                    </p>

                    <p className="mt-1 font-semibold">
                      {otherPerson?.district || 'Not available'}
                    </p>
                  </div>

                  {otherPerson?.village && (
                    <div className="sm:col-span-2">
                      <p className="text-xs text-slate-500">
                        Village
                      </p>

                      <p className="mt-1 font-semibold">
                        {otherPerson.village}
                      </p>
                    </div>
                  )}

                </div>
              </div>


              {/* Transaction Details */}
              <div className="mt-4 grid gap-3 sm:grid-cols-3">

                <div className="rounded-xl border p-4">
                  <p className="text-xs text-slate-500">
                    Quantity
                  </p>

                  <p className="mt-1 font-bold">
                    {transaction.quantity}{' '}
                    {transaction.listing?.unit}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-xs text-slate-500">
                    Total Amount
                  </p>

                  <p className="mt-1 font-bold">
                    <Money v={transaction.amount} />
                  </p>
                </div>

                {/* Payment Status */}
                <div className="rounded-xl border p-4">
                  <p className="text-xs text-slate-500">
                    Payment
                  </p>

                  {paymentPending && (
                    <p className="mt-1 font-bold text-amber-700">
                      PENDING
                    </p>
                  )}

                  {buyerMarkedPaid && (
                    <p className="mt-1 font-bold text-blue-700">
                      PAYMENT SUBMITTED
                    </p>
                  )}

                  {paymentPaid && (
                    <p className="mt-1 font-bold text-emerald-700">
                      ✓ PAID
                    </p>
                  )}
                </div>

              </div>


              {/* BUYER: Payment Pending */}
              {!isFarmer && paymentPending && (
                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">

                  <p className="font-bold text-emerald-900">
                    Payment Pending
                  </p>

                  <p className="mt-1 text-sm text-emerald-800">
                    Complete the payment with the farmer and
                    then submit the payment confirmation.
                  </p>

                  <button
                    onClick={() =>
                      handlePayment(transaction._id)
                    }
                    disabled={
                      payingId === transaction._id
                    }
                    className="mt-4 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {payingId === transaction._id
                      ? 'Submitting...'
                      : '✓ I Have Paid'}
                  </button>

                </div>
              )}


              {/* BUYER: Waiting */}
              {!isFarmer && buyerMarkedPaid && (
                <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">

                  <p className="font-bold text-blue-900">
                    Payment Submitted
                  </p>

                  <p className="mt-1 text-sm text-blue-800">
                    Your payment has been submitted.
                    Waiting for the farmer to confirm that
                    the amount was received.
                  </p>

                </div>
              )}


              {/* FARMER: Verify Payment */}
              {isFarmer && buyerMarkedPaid && (
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">

                  <p className="font-bold text-amber-900">
                    Buyer Claims Payment Sent
                  </p>

                  <p className="mt-1 text-sm text-amber-800">
                    Please verify your bank or UPI account
                    before confirming that the payment was
                    actually received.
                  </p>

                  <button
                    onClick={() =>
                      handleConfirmPayment(transaction._id)
                    }
                    disabled={
                      confirmingId === transaction._id
                    }
                    className="mt-4 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {confirmingId === transaction._id
                      ? 'Confirming...'
                      : '✓ Confirm Payment Received'}
                  </button>

                </div>
              )}


              {/* PAID — Both Users */}
              {paymentPaid && (
                <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
                  ✓ Payment has been verified and confirmed.
                  The transaction payment is complete.
                </div>
              )}


              {/* Contact */}
              <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                📞 Contact the{' '}
                {otherPersonRole.toLowerCase()} to finalize
                pickup and delivery details.
              </div>

            </div>
          );
        })
      )}
    </div>
  );
}

/* =========================
   CREATE LISTING
========================= */

function CreateListing({
  onClose,
  onDone,
}) {
  const [form, setForm] = useState(empty);
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (key, value) => {
    setForm({
      ...form,
      [key]: value,
    });
  };

  const submit = async (e) => {
    e.preventDefault();

    if (
      !form.cropName ||
      Number(form.quantity) <= 0 ||
      Number(form.expectedPrice) < 0
    ) {
      return toast.error(
        'Enter a crop, positive quantity and valid price'
      );
    }

    const fd = new FormData();

    Object.entries(form).forEach(
      ([key, value]) => {
        fd.append(key, value);
      }
    );

    if (image) {
      fd.append('image', image);
    }

    setSaving(true);

    try {
      await api.post(
        '/listings',
        fd,
        {
          headers: {
            'Content-Type':
              'multipart/form-data',
          },
        }
      );

      toast.success(
        'Crop listed successfully'
      );

      onDone();

    } catch (e) {
      toast.error(
        e.response?.data?.message ||
          'Could not create listing'
      );
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    ['cropName', 'Crop name'],
    ['quantity', 'Quantity'],
    ['expectedPrice', 'Expected price / unit'],
    ['unit', 'Unit'],
    ['state', 'State'],
    ['district', 'District'],
    ['harvestDate', 'Harvest date'],
    ['qualityGrade', 'Quality / grade'],
    ['contactPhone', 'Contact phone'],
  ];

  return (
    <Modal
      title="List harvested crop"
      onClose={onClose}
    >

      <form
        onSubmit={submit}
        className="grid gap-3 sm:grid-cols-2"
      >

        {fields.map(([key, label]) => (
          <label
            key={key}
            className="text-sm font-semibold text-slate-700"
          >

            {label}

            <input
              type={
                key === 'quantity' ||
                key === 'expectedPrice'
                  ? 'number'
                  : key === 'harvestDate'
                  ? 'date'
                  : 'text'
              }
              min={
                key === 'quantity'
                  ? '0.01'
                  : key === 'expectedPrice'
                  ? '0'
                  : undefined
              }
              step={
  key === 'quantity'
    ? '0.01'
    : key === 'expectedPrice'
    ? '0.01'
    : undefined
}
              value={form[key]}
              onChange={(e) =>
                set(key, e.target.value)
              }
              className="mt-1 w-full rounded-xl border px-3 py-2.5 font-normal"
              required={[
                'cropName',
                'quantity',
                'expectedPrice',
                'unit',
                'state',
                'district',
              ].includes(key)}
            />

          </label>
        ))}

        <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
          Description

          <textarea
            value={form.description}
            onChange={(e) =>
              set(
                'description',
                e.target.value
              )
            }
            className="mt-1 min-h-24 w-full rounded-xl border px-3 py-2.5 font-normal"
          />
        </label>

        <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
          Crop image

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) =>
              setImage(
                e.target.files?.[0] || null
              )
            }
            className="mt-1 block w-full rounded-xl border p-2 text-sm"
          />
        </label>

        <button
          disabled={saving}
          className="sm:col-span-2 rounded-xl bg-emerald-700 py-3 font-bold text-white"
        >
          {saving
            ? 'Publishing…'
            : 'Publish listing'}
        </button>

      </form>
    </Modal>
  );
}


/* =========================
   MODAL
========================= */

function Modal({
  title,
  onClose,
  children,
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">

      <div className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-3xl bg-white p-6 shadow-2xl">

        <div className="mb-5 flex items-center justify-between">

          <h2 className="text-2xl font-black">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100"
          >
            <X />
          </button>

        </div>

        {children}

      </div>
    </div>
  );
}


/* =========================
   EMPTY
========================= */

function Empty({ title }) {
  return (
    <div className="rounded-2xl border bg-white p-12 text-center text-slate-500">
      {title}
    </div>
  );
}