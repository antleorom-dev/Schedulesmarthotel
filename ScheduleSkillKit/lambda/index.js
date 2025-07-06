const Alexa = require('ask-sdk-core');

const actividades = {
    "es": {
        "lunes": "Desayuno a las 9:00, visita al centro histórico a las 11:00 y almuerzo a las 14:00.",
        "martes": "Desayuno a las 9:00, recorrido panorámico a las 10:30 y cena temática a las 20:00.",
        "miércoles": "Desayuno a las 9:00, visita a la Alhambra a las 12:00 y espectáculo flamenco a las 21:00.",
        "jueves": "Desayuno a las 9:00, tiempo libre en el mercado local a las 11:00 y almuerzo a las 14:00.",
        "viernes": "Desayuno a las 9:00, paseo a las 11:30 y cena en restaurante a las 20:00.",
        "sábado": "Desayuno a las 9:00, excursión a la montaña a las 10:00 y fiesta de despedida a las 22:00.",
        "domingo": "Desayuno a las 9:00 y regreso a las 12:00."
    },
    "en": {
        "monday": "Breakfast at 9:00 AM, historical center tour at 11:00 AM, and lunch at 2:00 PM.",
        "tuesday": "Breakfast at 9:00 AM, panoramic tour at 10:30 AM, and themed dinner at 8:00 PM.",
        "wednesday": "Breakfast at 9:00 AM, Alhambra visit at 12:00 PM, and flamenco show at 9:00 PM.",
        "thursday": "Breakfast at 9:00 AM, free time at the local market at 11:00 AM, and lunch at 2:00 PM.",
        "friday": "Breakfast at 9:00 AM, walk at 11:30 AM, and dinner at the restaurant at 8:00 PM.",
        "saturday": "Breakfast at 9:00 AM, mountain excursion at 10:00 AM, and farewell party at 10:00 PM.",
        "sunday": "Breakfast at 9:00 AM and departure at 12:00 PM."
    }
};

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const locale = handlerInput.requestEnvelope.request.locale;
        let speakOutput = locale.startsWith('es')
            ? '¡Hola! ¿Para qué día te gustaría conocer el itinerario?'
            : 'Hello! For which day would you like to know the itinerary?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(locale.startsWith('es') ? '¿Qué día te interesa?' : 'Which day are you interested in?')
            .getResponse();
    }
};

const ItinerarioIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ItinerarioIntent';
    },
    handle(handlerInput) {
        const locale = handlerInput.requestEnvelope.request.locale;
        const idioma = locale.startsWith('es') ? 'es' : 'en';
        let slotValue = Alexa.getSlotValue(handlerInput, 'day');

        console.log("Valor capturado en el slot:", slotValue);  

        if (!slotValue) {
            return handlerInput.responseBuilder
                .speak(idioma === 'es' ? 'No entendí el día. ¿Puedes repetirlo?' : 'I did not understand the day. Can you repeat it?')
                .reprompt(idioma === 'es' ? '¿Qué día te interesa?' : 'Which day are you interested in?')
                .getResponse();
        }

        // Convertir la fecha en un día de la semana
        let diaSemana;
        try {
            let fecha = new Date(slotValue);
            let opciones = { weekday: 'long', timeZone: 'UTC', locale: idioma === 'es' ? 'es-ES' : 'en-US' };
            diaSemana = fecha.toLocaleDateString(idioma === 'es' ? 'es-ES' : 'en-US', opciones).toLowerCase();
        } catch (error) {
            console.error("Error al convertir la fecha:", error);
            return handlerInput.responseBuilder
                .speak(idioma === 'es' ? 'No pude entender la fecha. Intenta decir algo como "el próximo lunes".' 
                                        : 'I couldn’t understand the date. Try saying something like "next Monday".')
                .reprompt(idioma === 'es' ? '¿Qué día te interesa?' : 'Which day are you interested in?')
                .getResponse();
        }

        console.log("Día de la semana identificado:", diaSemana);

        if (actividades[idioma][diaSemana]) {
            let respuesta = idioma === 'es'
                ? `Las actividades programadas para el ${diaSemana} son: ${actividades[idioma][diaSemana]}`
                : `The scheduled activities for ${diaSemana} are: ${actividades[idioma][diaSemana]}`;

            return handlerInput.responseBuilder
                .speak(respuesta)
                .reprompt(idioma === 'es' ? '¿Te interesa otro día?' : 'Would you like to know another day?')
                .getResponse();
        } else {
            return handlerInput.responseBuilder
                .speak(idioma === 'es' ? 'Lo siento, no tengo actividades para ese día.' 
                                        : 'Sorry, I have no activities scheduled for that day.')
                .reprompt(idioma === 'es' ? '¿Te interesa otro día?' : 'Would you like to know another day?')
                .getResponse();
        }
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const locale = handlerInput.requestEnvelope.request.locale;
        const speakOutput = locale.startsWith('es')
            ? 'Puedes preguntarme qué actividades hay el lunes, martes o cualquier día de la semana.'
            : 'You can ask me about the activities scheduled for Monday, Tuesday, or any day of the week.';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = handlerInput.requestEnvelope.request.locale.startsWith('es') ? 'Adiós.' : 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.error(`Error handled: ${error.message}`);
        return handlerInput.responseBuilder
            .speak('Lo siento, algo salió mal. Inténtalo de nuevo.')
            .reprompt('Intenta preguntarme por el itinerario de un día específico.')
            .getResponse();
    }
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        ItinerarioIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();

