import { Link } from "@remix-run/react"

interface CardProps {
    target: string;
    image: string;
    title: string;
    description: string;
}

export default function Card(props: CardProps) {
    return (
        <div className="card w-96 bg-base-100 shadow-xl">
            <Link to={props.target}>
                <figure><img src={props.image} alt={props.title} className="max-h-72" /></figure>
                <div className="card-body">
                    <h2 className="card-title">{props.title}</h2>
                    <p>{props.description}</p>
                </div>
            </Link >
        </div>

    )
}
