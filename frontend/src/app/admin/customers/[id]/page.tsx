"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { customerApi, sessionApi, photoApi, appointmentApi } from "@/lib/api";
import { Customer, ServiceSession, Photo } from "@/types";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Camera,
  Plus,
  Phone,
  Mail,
  MapPin,
  Scissors,
  Star,
  ChevronDown,
  ChevronUp,
  X,
  ImageIcon,
} from "lucide-react";

export default function CustomerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const customerId = Number(params.id);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [sessions, setSessions] = useState<ServiceSession[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"timeline" | "sessions" | "photos" | "edit">("timeline");
  const [showNewSession, setShowNewSession] = useState(false);
  const [showUploadPhoto, setShowUploadPhoto] = useState(false);

  // Session form state
  const [sessionForm, setSessionForm] = useState({
    serviceType: "",
    technicianName: "",
    serviceDescription: "",
    cost: "",
    nextSessionOption: "days_30",
    customNextDate: "",
    notes: "",
    status: "completed",
  });

  useEffect(() => {
    loadCustomerData();
  }, [customerId]);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      const [custRes, sessRes, photoRes] = await Promise.all([
        customerApi.getById(customerId),
        sessionApi.getCustomerSessions(customerId),
        photoApi.getCustomerPhotos(customerId),
      ]);
      setCustomer(custRes.data.data);
      setSessions(sessRes.data.data || []);
      setPhotos(photoRes.data.data || []);
    } catch (err: any) {
      toast.error("Failed to load customer data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        customerId,
        serviceType: sessionForm.serviceType,
        technicianName: sessionForm.technicianName,
        serviceDescription: sessionForm.serviceDescription,
        cost: sessionForm.cost ? parseFloat(sessionForm.cost) : 0,
        nextSessionOption: sessionForm.nextSessionOption,
        notes: sessionForm.notes,
        status: sessionForm.status,
      };

      if (sessionForm.customNextDate && sessionForm.nextSessionOption === "custom") {
        payload.nextSessionDate = sessionForm.customNextDate;
      }

      await sessionApi.create(payload);
      toast.success("Session created successfully!");
      setShowNewSession(false);
      resetSessionForm();
      loadCustomerData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create session");
    }
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    const fileInput = document.getElementById("photoFile") as HTMLInputElement;
    const photoType = (document.getElementById("photoType") as HTMLSelectElement)?.value;

    if (!fileInput?.files?.length) {
      toast.error("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    formData.append("customerId", customerId.toString());
    formData.append("photoType", photoType || "other");

    try {
      await photoApi.upload(formData);
      toast.success("Photo uploaded!");
      setShowUploadPhoto(false);
      loadCustomerData();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    }
  };

  const resetSessionForm = () => {
    setSessionForm({
      serviceType: "",
      technicianName: "",
      serviceDescription: "",
      cost: "",
      nextSessionOption: "days_30",
      customNextDate: "",
      notes: "",
      status: "completed",
    });
  };

  const getNextSessionLabel = (interval?: number) => {
    if (!interval) return "";
    return `After ${interval} days`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="badge badge-success">Completed</span>;
      case "upcoming":
        return <span className="badge badge-info">Upcoming</span>;
      case "missed":
        return <span className="badge badge-danger">Missed</span>;
      case "cancelled":
        return <span className="badge badge-gray">Cancelled</span>;
      default:
        return <span className="badge badge-info">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!customer) {
    return <div className="text-center p-12 text-gray-500">Customer not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push("/admin/customers")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Customers
      </button>

      {/* Profile Header */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            {customer.photoUrl ? (
              <img
                src={customer.photoUrl}
                alt={customer.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <span className="text-blue-600 font-bold text-3xl">
                {customer.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
              {customer.status === "active" ? (
                <span className="badge badge-success">Active</span>
              ) : (
                <span className="badge badge-gray">Inactive</span>
              )}
            </div>

            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
              {customer.phoneNumber && (
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" /> {customer.phoneNumber}
                </span>
              )}
              {customer.email && customer.email !== "walkin@example.com" && (
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" /> {customer.email}
                </span>
              )}
              {customer.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {customer.city}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowNewSession(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Session
            </button>
            <button
              onClick={() => setShowUploadPhoto(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Camera className="w-4 h-4" /> Photo
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{customer.totalVisits}</p>
            <p className="text-xs text-gray-500">Total Visits</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{customer.totalSessions}</p>
            <p className="text-xs text-gray-500">Sessions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{customer.totalOrders}</p>
            <p className="text-xs text-gray-500">Purchases</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {customer.hairExtensionType || "—"}
            </p>
            <p className="text-xs text-gray-500">Extension Type</p>
          </div>
        </div>
      </div>

      {/* Hair Extension Info */}
      {customer.hairExtensionType && (
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Scissors className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-gray-900">Hair Extension Details</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Type:</span>
              <p className="font-medium">{customer.hairExtensionType}</p>
            </div>
            <div>
              <span className="text-gray-500">Length:</span>
              <p className="font-medium">{customer.hairLength || "—"}</p>
            </div>
            <div>
              <span className="text-gray-500">Color:</span>
              <p className="font-medium">{customer.hairColor || "—"}</p>
            </div>
            <div>
              <span className="text-gray-500">Installed:</span>
              <p className="font-medium">
                {customer.installationDate
                  ? new Date(customer.installationDate).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {(["timeline", "sessions", "photos", "edit"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "timeline" && (
        <div className="space-y-4">
          {customer.timeline && customer.timeline.length > 0 ? (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

              <div className="space-y-6">
                {customer.timeline.map((event, idx) => (
                  <div key={idx} className="relative pl-14">
                    {/* Dot */}
                    <div
                      className={`absolute left-4 w-4 h-4 rounded-full border-2 border-white ${
                        event.type === "INSTALLATION"
                          ? "bg-purple-500"
                          : event.type === "SESSION"
                          ? "bg-blue-500"
                          : "bg-green-500"
                      }`}
                    ></div>

                    <div className="card p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-400">
                              {new Date(event.date).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                event.type === "INSTALLATION"
                                  ? "bg-purple-100 text-purple-700"
                                  : event.type === "SESSION"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {event.type}
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-900 mt-1">
                            {event.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-0.5">
                            {event.description}
                          </p>
                        </div>
                        {event.amount && (
                          <span className="text-sm font-bold text-gray-900">
                            {event.amount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center p-12 text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No timeline events yet</p>
            </div>
          )}

          {/* Next session card */}
          {sessions.filter((s) => s.nextSessionDate).length > 0 && (
            <div className="card p-4 border-l-4 border-l-blue-500 mt-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-900">Next Session:</span>
                <span className="font-bold text-blue-600">
                  {new Date(
                    sessions.filter((s) => s.nextSessionDate)[0].nextSessionDate!
                  ).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "sessions" && (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.sessionId} className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">
                      {session.serviceType}
                    </h4>
                    {getStatusBadge(session.status)}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(session.sessionDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {session.technicianName && (
                    <p className="text-sm text-gray-600 mt-1">
                      Staff: {session.technicianName}
                    </p>
                  )}
                  {session.serviceDescription && (
                    <p className="text-sm text-gray-600 mt-1">
                      {session.serviceDescription}
                    </p>
                  )}
                  {session.cost && session.cost > 0 && (
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      Cost: ₹{session.cost}
                    </p>
                  )}
                </div>

                <div className="text-right text-sm">
                  {session.nextSessionDate && (
                    <div className="text-blue-600 font-medium">
                      Next:{" "}
                      {new Date(session.nextSessionDate).toLocaleDateString()}
                    </div>
                  )}
                  {session.customerRating && (
                    <div className="flex items-center gap-1 mt-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{session.customerRating}/5</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Session Photos */}
              {session.photos && session.photos.length > 0 && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  {session.photos.map((photo) => (
                    <a
                      key={photo.photoId}
                      href={photo.publicUrl}
                      target="_blank"
                      className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200"
                    >
                      <img
                        src={photo.publicUrl}
                        alt={photo.photoType}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}

          {sessions.length === 0 && (
            <div className="text-center p-12 text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No sessions yet</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "photos" && (
        <div>
          {photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.photoId} className="card overflow-hidden group">
                  <div className="relative aspect-square">
                    <img
                      src={photo.publicUrl}
                      alt={photo.fileName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <a
                        href={photo.publicUrl}
                        target="_blank"
                        className="opacity-0 group-hover:opacity-100 text-white bg-black/50 p-2 rounded-lg"
                      >
                        <ImageIcon className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                  <div className="p-2">
                    <span className="text-[10px] font-bold uppercase text-gray-500">
                      {photo.photoType}
                    </span>
                    <p className="text-xs text-gray-400 truncate">
                      {photo.fileName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-12 text-gray-400">
              <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No photos yet</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "edit" && (
        <div className="card p-6">
          <p className="text-gray-500 text-center py-8">
            Edit functionality available via the API. Use customer update endpoint.
          </p>
        </div>
      )}

      {/* New Session Modal */}
      {showNewSession && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">New Service Session</h2>
              <button
                onClick={() => setShowNewSession(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type *
                </label>
                <select
                  required
                  value={sessionForm.serviceType}
                  onChange={(e) =>
                    setSessionForm({ ...sessionForm, serviceType: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="">Select service type</option>
                  <option value="Installation">Installation</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Removal">Removal</option>
                  <option value="Repair">Repair</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Follow-up">Follow-up</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Technician / Staff Name
                </label>
                <input
                  type="text"
                  value={sessionForm.technicianName}
                  onChange={(e) =>
                    setSessionForm({ ...sessionForm, technicianName: e.target.value })
                  }
                  className="input-field"
                  placeholder="Staff name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={sessionForm.serviceDescription}
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      serviceDescription: e.target.value,
                    })
                  }
                  className="input-field"
                  rows={2}
                  placeholder="Session details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={sessionForm.cost}
                    onChange={(e) =>
                      setSessionForm({ ...sessionForm, cost: e.target.value })
                    }
                    className="input-field"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={sessionForm.status}
                    onChange={(e) =>
                      setSessionForm({ ...sessionForm, status: e.target.value })
                    }
                    className="input-field"
                  >
                    <option value="completed">Completed</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="missed">Missed</option>
                  </select>
                </div>
              </div>

              {/* Next Session Tracking */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Next Session
                </label>
                <select
                  value={sessionForm.nextSessionOption}
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      nextSessionOption: e.target.value,
                    })
                  }
                  className="input-field mb-2"
                >
                  <option value="days_30">After 30 days</option>
                  <option value="days_45">After 45 days</option>
                  <option value="days_60">After 60 days</option>
                  <option value="custom">Custom date</option>
                  <option value="">No next session</option>
                </select>

                {sessionForm.nextSessionOption === "custom" && (
                  <input
                    type="date"
                    value={sessionForm.customNextDate}
                    onChange={(e) =>
                      setSessionForm({
                        ...sessionForm,
                        customNextDate: e.target.value,
                      })
                    }
                    className="input-field"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={sessionForm.notes}
                  onChange={(e) =>
                    setSessionForm({ ...sessionForm, notes: e.target.value })
                  }
                  className="input-field"
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  Create Session
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewSession(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Photo Modal */}
      {showUploadPhoto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Upload Photo</h2>
              <button
                onClick={() => setShowUploadPhoto(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadPhoto} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photo Type
                </label>
                <select id="photoType" className="input-field" required>
                  <option value="before">Before</option>
                  <option value="after">After</option>
                  <option value="scalp">Scalp</option>
                  <option value="progress">Progress</option>
                  <option value="document">Document</option>
                  <option value="profile">Profile</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Choose File
                </label>
                <input
                  id="photoFile"
                  type="file"
                  accept="image/*"
                  className="input-field"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadPhoto(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
