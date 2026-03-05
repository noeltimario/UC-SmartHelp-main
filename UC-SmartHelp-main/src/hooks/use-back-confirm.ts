import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const useBackConfirm = () => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // Push a new state to the history stack when component mounts
    const unloadHandler = () => {
      window.history.pushState(null, "", window.location.pathname);
    };

    // Initial setup
    window.history.pushState(null, "", window.location.pathname);

    // Handle popstate event (back button click)
    const handlePopState = () => {
      setShowConfirm(true);
      // Push state back to prevent navigation
      window.history.pushState(null, "", window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("load", unloadHandler);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("load", unloadHandler);
    };
  }, []);

  const handleConfirmLeave = () => {
    // Logout user
    localStorage.removeItem("uc_guest");
    localStorage.removeItem("user");
    
    setShowConfirm(false);
    
    // Navigate to home page
    navigate("/");
  };

  const handleStayOnPage = () => {
    setShowConfirm(false);
  };

  return {
    showConfirm,
    handleConfirmLeave,
    handleStayOnPage,
  };
};
