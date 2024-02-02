import {CardContent, CardFooter, CardHeader, Card as UiCard } from "~/components/ui/card"
import { Link } from "@remix-run/react";

interface CardProps {
  target: string;
  image: string;
  title: string;
  description: string;
}

export default function Card(props: CardProps) {
  return (
    <UiCard>
      <Link to={props.target}>
        <CardHeader>
        <figure>
          <img src={props.image} alt={props.title} className="h-48" />
        </figure>
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl">{props.title}</h2>
        </CardContent>
        <CardFooter>
          <p>{props.description}</p>
        </CardFooter>
      </Link>
    </UiCard>
  );
}
