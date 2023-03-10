import type { ActionArgs} from "@remix-run/node";
import { json } from "@remix-run/node";

export async function action({ request }: ActionArgs) {
    const formData = await request.formData()
    const isSuperuser = formData.get('isSuperuser')
    if (isSuperuser !== null) {

    }
    return json({ error: null, ok: true });
}