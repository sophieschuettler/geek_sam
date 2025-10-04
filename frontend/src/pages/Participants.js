import CreateParticipant from "../components/CreateParticipant";
import ParticipantList from "../components/ParticipantList";

<CreateParticipant onSubmit={(formData) => {
  fetch("http://localhost:4000/api/participants", {
    method: "POST",
    body: formData,
  }).then(() => alert("Teilnehmer gespeichert!"));
}} />

export default function Participants() {
  return (
    <div className="space-y-8 p-4">
      <CreateParticipant />
      <hr className="my-6 border-t" />
      <ParticipantList />
    </div>
  );
}
