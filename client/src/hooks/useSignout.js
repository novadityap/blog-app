import { useSignoutMutation } from "@/services/authApi";
import { useDispatch } from "react-redux";
import { clearAuth } from "@/lib/features/authSlice";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const useSignout = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [signout] = useSignoutMutation();

  const handleSignout = async () => {
    try {
      await signout();
      dispatch(clearAuth());
      router.replace("/");
    } catch (e) {
      toast.error(e.message);
    }
  };

  return { handleSignout };
};

export default useSignout;