import { useSignoutMutation } from "@/services/authApi";
import { useDispatch } from "react-redux";
import { clearAuth } from "@/features/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const useSignout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [signout] = useSignoutMutation();

  const handleSignout = async () => {
    try {
      await signout();
      dispatch(clearAuth());
      navigate("/");
    } catch (e) {
      toast.error(e.message);
    }
  };

  return { handleSignout };
};

export default useSignout;