import { NextResponse } from "next/server";
import { z } from "zod";
import { KG_MAX, KG_MIN } from "../../../lib/pricing";

const quantitySchema = z.number().min(KG_MIN).max(KG_MAX);

export async function POST(request: Request) {
    const { quantity } = await request.json();

    const validationResult = quantitySchema.safeParse(quantity);
    if (!validationResult.success) {
        return NextResponse.json(
            {
                message: "La cantidad ingresada es inválida.",
            },
            { status: 400 }
        );
    }

    return NextResponse.json(
        { message: "Validación exitosa" },
        { status: 200 }
    );
}
