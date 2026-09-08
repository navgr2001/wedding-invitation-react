import { useEffect } from "react";

import { useWeddingInvitationViewModel } from "./viewmodels/app/useWeddingInvitationViewModel";
import WeddingInvitationView from "./views/WeddingInvitationView";
import { enableMediaProtection } from "./utils/mediaProtection";

import "./styles/style.css";

function App() {
  const { content } = useWeddingInvitationViewModel();

  useEffect(() => {
    const disableProtection = enableMediaProtection();

    return disableProtection;
  }, []);

  return <WeddingInvitationView content={content} />;
}

export default App;
