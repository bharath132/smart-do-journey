import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import TodoApp from "@/components/TodoApp";
import LoadingSpinner from "@/components/LoadingSpinner";

const Index = () => {
  const { user, isGuest, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user && !isGuest) {
      navigate('/');
    }
  }, [user, isGuest, isLoading, navigate]);

  if (isLoading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  if (!user && !isGuest) {
    return null;
  }

  return <TodoApp />;
};

export default Index;
