import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { Loader2, MessageCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ModuleContainer from "../components/ModuleContainer";
export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const { userModules } = useAuth();
  const { profile } = useAuth();
  // initialize loading to false if modules were preloaded in AuthContext
  const [loading, setLoading] = useState(!userModules);
  const username = user.email.split("@")[0];
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // If we already preloaded user modules in AuthContext, use them
    if (userModules) {
      setModules(userModules);
      setLoading(false);
      return;
    }

    const fetchModules = async () => {
      try {
        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select("id")
          .eq("userid", user.id)
          .maybeSingle();

        if (studentError) throw studentError;
        if (!studentData) throw new Error("Student record not found.");

        const { data: userModulesResp, error: modError } = await supabase
          .from("user_modules")
          .select(
            `
            moduleid,
            modules:moduleid (
              id,
              name,
              code
            )
          `,
          )
          .eq("userid", studentData.id);

        if (modError) throw modError;
        const formattedModules = userModulesResp?.map((u) => u.modules) || [];
        setModules(formattedModules);
      } catch (err) {
        console.error("❌ Error fetching modules:", err.message);
        setModules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [user, navigate]);

  // NOTE: presence/online-user feature removed per request

  // const handleModuleClick = (moduleId) => navigate(`/chat/${moduleId}`);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        Loading modules...
      </div>
    );

  if (modules.length === 0)
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#F2EFE8] px-6 text-black">
        <h2 className="mb-3 text-2xl font-semibold">No Modules Found</h2>
        <p className="mb-6 max-w-sm text-center text-gray-600">
          You haven't selected any modules yet. Add some to start discussions!
        </p>
        <button
          onClick={() => navigate("/modules")}
          className="rounded-xl bg-[#6B4F4F] px-6 py-2 font-medium text-white transition-all hover:bg-[#553b3b]"
        >
          Add Modules
        </button>
      </div>
    );

  return (
    <div className="font-inter">
      <Navbar />
      <div className="flex min-h-screen flex-col bg-[#F2EFE8] px-4 pt-16 pb-20 text-black">
        <div className="mx-auto flex w-full max-w-md flex-col items-center">
          <h1 className="mb-6 text-2xl font-semibold">
            Welcome{" "}
            <span className="font-bold text-yellow-500">{username}</span>
          </h1>
          {/* presence / online-count removed */}
          {/* MVP notice */}
          <div className="mb-4 w-full">
            <div
              role="status"
              className="rounded-md border-l-4 border-yellow-400 bg-yellow-50 px-4 py-3 text-sm text-yellow-800"
            >
              <strong className="font-semibold">MVP</strong>
              <span className="ml-2">
                Basic version of Unichat with simple chat features.
              </span>
            </div>
          </div>

          {/* Dynamic Module Grid */}
          <ModuleContainer modules={modules} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
