import { useWeddingInvitationViewModel } from "./viewmodels/app/useWeddingInvitationViewModel";
import WeddingInvitationView from "./views/WeddingInvitationView";
import "./styles/style.css";

function App() {
  const { content } = useWeddingInvitationViewModel();

  return <WeddingInvitationView content={content} />;
}

export default App;
