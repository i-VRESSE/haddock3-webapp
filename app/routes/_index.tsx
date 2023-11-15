import Card from "~/components/Card";
import builder_image from "~/components/cards/builder.png";
import upload_image from "~/components/cards/upload.svg";
import manage_image from "~/components/cards/manage.jpg";

const cards = [
  {
    target: "/builder",
    image: builder_image,
    title: "Build",
    description: "Use the workflow builder to create and submit a job.",
  },
  {
    target: "/upload",
    image: upload_image,
    title: "Upload",
    description: "Upload a workflow and submit as job.",
  },
  {
    target: "/jobs",
    image: manage_image,
    title: "Manage",
    description: "Explore and analyse the results of completed jobs.",
  },
];

export default function Index() {
  return (
    <main className="flex flex-wrap justify-evenly gap-4 p-24">
      {cards.map((card) => (
        <Card key={card.target} {...card} />
      ))}
    </main>
  );
}
