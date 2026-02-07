import { useEffect, useState } from 'react';
import { useAuth } from '../../context/authContext';
import SharedToiletForm from '../../components/SharedToilet/SharedToiletForm';
import SharedToiletList from '../../components/SharedToilet/SharedToiletList';
import {
  fetchUserSharedToilets,
  createSharedToilet,
  updateSharedToilet,
  deleteSharedToilet,
} from '../../services/sharedToiletService';

const EMPTY_FORM = {
  toilet_name: '',
  toilet_description: '',
  eircode: '',
  contact_number: '',
  type: 'free',
  price: '',
};

const SharedToiletPage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user) return;

    fetchUserSharedToilets(user.uid)
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error(err);
        setList([]);
      });
  }, [user]);

  const changeForm = (key, value) => {
    setForm((prev) => {

      if (key === "type" && value !== "paid") {
        return { ...prev, type: value, price: "" };
      }
      return { ...prev, [key]: value };
    });
  };


  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      toilet_name: form.toilet_name?.trim(),
      toilet_description: form.toilet_description?.trim(),
      eircode: form.eircode?.trim(),
      contact_number: form.contact_number?.trim(),
      type: form.type,
      price: form.price?.trim(),
      toilet_paper_accessibility: form.toilet_paper_accessibility,
      userId: user.uid,
    };


    if (payload.type !== "paid") {
      delete payload.price;
    } else if (!payload.price) {
      alert("Paid toilets must select a price");
      setLoading(false);
      return;
    }


    try {
      if (editingId) {
        const updated = await updateSharedToilet(editingId, payload);
        setList((prev) =>
          (Array.isArray(prev) ? prev : []).map((t) =>
            t._id === editingId ? updated : t
          )
        );
      } else {
        const created = await createSharedToilet(payload);
        setList((prev) => [created, ...(Array.isArray(prev) ? prev : [])]);
      }

      setForm(EMPTY_FORM);
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      console.error("SUBMIT ERROR:", err);
      alert(err?.response?.data?.message || err.message || "Submit failed");
    } finally {
      setLoading(false);
    }
  };




  const handleEdit = (toilet) => {
    setForm({
      toilet_name: toilet.toilet_name || "",
      toilet_description: toilet.toilet_description || "",
      eircode: toilet.eircode || "",
      contact_number: toilet.contact_number || "",
      type: toilet.type || "free",
      price: toilet.price || "",
    });
    setEditingId(toilet._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };



  const handleDelete = async (id) => {
    await deleteSharedToilet(id);
    setList((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      return arr.filter((t) => t._id !== id);
    });

  };

  return (
    <div className="pt-24 px-3 sm:px-6 lg:px-10 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* buutton+form */}
        <div
          className={[
            "md:col-span-12",                
            showForm ? "lg:col-span-6" : "lg:col-span-0", 
          ].join(" ")}
        >
          
          {/*  toggle */}
          <div className="flex items-start justify-start">
            <button
              type="button"
              onClick={() => {

                setShowForm((prev) => {
                  const next = !prev;


                  if (next) {
                    setForm(EMPTY_FORM);
                    setEditingId(null);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }

                  return next;
                });
              }}
              className={[
                "inline-flex items-center justify-center",
                "h-10 w-10 rounded-full",
                "shadow-sm transition",
                "focus:outline-none focus:ring-2 focus:ring-offset-2",
                showForm
                  ? "bg-white border border-slate-200 text-indigo-600 hover:bg-slate-50 focus:ring-indigo-500"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
              ].join(" ")}
              aria-label={showForm ? "Close form" : "Share a toilet"}
              title={showForm ? "Close form" : "Share a toilet"}
            >
              <span className="text-xl leading-none font-semibold">
                {showForm ? "−" : "+"}
              </span>
            </button>

            <span className="ml-3 mt-2 text-sm text-slate-600 select-none">
              {showForm ? "Hide form" : "Share a toilet"}
            </span>
          </div>


          {showForm && (
            <div className="mt-4">
              <SharedToiletForm
                value={form}
                onChange={changeForm}
                onSubmit={submitForm}
                onCancel={() => {
                  setForm(EMPTY_FORM);     
                  setEditingId(null);      
                  setShowForm(false);     
                }}
                isEditing={!!editingId}
                loading={loading}
              />
            </div>
          )}
        </div>

        {/* List */}
        <div
          className={[
            "md:col-span-12",
            showForm ? "lg:col-span-6" : "lg:col-span-12",
            "flex flex-col min-h-0",
          ].join(" ")}
        >

          <div className="min-h-0 lg:max-h-[calc(100vh-160px)] lg:overflow-auto">
            <SharedToiletList
              items={list}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>

      </div>
    </div>
  );


};

export default SharedToiletPage;
