import { NextResponse } from 'next/server';
import { open } from 'maxmind';
import path from 'path';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const IP = searchParams.get('IP');
    const locale = searchParams.get('locale');

    if (!IP) {
        return NextResponse.json({
            message: "No IP provided"
        }, {
            status: 400
        });
    }

    let localeForLookup = "en";
    if (locale.startsWith("ja") === true) localeForLookup = "ja";
    if (locale.startsWith("zh-Hans") === true) localeForLookup = "zh-CN";
    
    const { succeeded, result, error } = await lookupIP(IP, localeForLookup);

    if (succeeded) {
        return NextResponse.json({
            message: "OK",
            result: result
        }, {
            status: 200
        });
    }
    else {
        console.log(error);
        return NextResponse.json({
            message: "Internal Server Error"
        }, {
            status: 500
        });
    }
}

export async function POST(request) {
    const { IP, locale } = await request.json();

    if (!IP) {
        return NextResponse.json({
            message: "No IP provided"
        }, {
            status: 400
        });
    }

    let localeForLookup = "en";
    if (locale == "ja") localeForLookup = "ja";
    if (locale == "zh-Hans") localeForLookup = "zh-CN";

    const { succeeded, result, error } = await lookupIP(IP, localeForLookup);

    if (succeeded) {
        return NextResponse.json({
            message: "OK",
            result: result
        }, {
            status: 200
        });
    }
    else {
        console.log(error);
        return NextResponse.json({
            message: "Internal Server Error"
        }, {
            status: 500
        });
    }
}

async function lookupIP(IP, locale) {
    try {
        const dbPath = path.resolve(process.cwd(), 'private', 'GeoIP2-City.mmdb');
        const lookup = await open(dbPath);

        const response = lookup.get(IP);

        if (!response) {
            throw Error("Invalid response")
        }

        const result = {
            IP,
            continent: response.continent?.names[locale] ?? "",
            country: response.country?.names[locale] ?? "",
            registeredCountry: response.registered_country?.names[locale] ?? "",
            city: response.city?.names[locale] ?? "",
            location: {
                accuracyRadius: response.location?.accuracy_radius,
                latitude: response.location?.latitude,
                longitude: response.location?.longitude,
                timezone: response.location?.time_zone ?? ""
            }
        };

        return {
            succeeded: true,
            result: result
        };
    } catch (error) {
        return {
            succeeded: false,
            error: error
        };
    }
}
