import { weddingContent } from "../../models/weddingContent";
import { useWeddingInteractions } from "../wedding/useWeddingInteractions";

export function useWeddingInvitationViewModel() {
  useWeddingInteractions();

  return {
    content: weddingContent,
  };
}
