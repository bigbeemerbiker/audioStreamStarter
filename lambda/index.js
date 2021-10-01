/* eslint-disable no-mixed-operators */
/* eslint-disable  func-names */
/* eslint-disable  no-console */

// THIS WORKS TO INVOKE .addAudioPlayerPlayDirective() OR .addVideoAppLaunchDirective()
// COMES FROM DABBLE LABS -- INVOCATION = "TEMPLATE THREE"

const Alexa = require('ask-sdk-core');
const Util = require('./util.js'); //importing the utils class reference

/* 
STREAMS is an array holding stuff that tells the system about the stream URL & associated images
that array contains, as it happens, a single {..} object.
That object contains 3 properties:
  token, url, metadata.
  The metadata property is itself an object containing 4 properties:
    title, subtitle, art, backgroundImage.
      art is actually an object containing 1 property: sources.
        sources property is an array: 
          That array contains a single object containing 4 props:
            contentDescription, url, widthPixels, heightPixels.
      backgroundImage is an object containing 1 property: sources.
        The sources prop is an array with the same structure as the prop of that name under 'art'
*/
const STREAMS = [
  {
    //'token': 'dabble-radio-1',
    'token': 'charlie-singing-1',
    //'url': 'https://stream.zeno.fm/efe91skxn18uv.m3u',
    //'url': 'https://open.live.bbc.co.uk/mediaselector/5/select/version/2.0/mediaset/http-icy-mp3-a/vpid/bbc_radio_newcastle/format/pls.pls',
    //'url': 'https://faproductions.uk/wp-content/uploads/2021/09/SmokeGetsInYourEyes_Chaz.mp3',
    //'url': Util.getS3PreSignedUrl("Media/SmokeGetsInYourEyes_Chaz.m4a"),
    'url': Util.getS3PreSignedUrl("Media/MyWay_fullChaz.mp3"),
    'metadata': {
      'title': 'Charlie singing',  // this is spoken
      'subtitle': 'for Jean Macdonald\'s 100th',
      'art': {
        'sources': [
          {
            'contentDescription': 'Charlie singing',
            'url': Util.getS3PreSignedUrl('Media/ChazSinging_512.png'),
            //'url': 'https://faproductions.uk/wp-content/uploads/2021/09/ChazSinging_512.jpg',
            //'url': 'https://s3.amazonaws.com/cdn.dabblelab.com/img/audiostream-starter-512x512.png',
            'widthPixels': 512,
            'heightPixels': 512,
          },
        ],
      },
      'backgroundImage': {
        'sources': [
          {
            'contentDescription': 'Charlie singing',
            'url': Util.getS3PreSignedUrl('Media/100thFamilyOnBeach_1200x800.jpg'),
            'widthPixels': 1200,
            'heightPixels': 800,
          },
        ],
      },
    }, // end of metadata item
  },
];

const PlayStreamIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
      || handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (
           handlerInput.requestEnvelope.request.intent.name === 'PlayStreamIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ResumeIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.LoopOnIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NextIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PreviousIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.RepeatIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ShuffleOnIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StartOverIntent'
      );
  },
  handle(handlerInput) {
    const stream = STREAMS[0];
    let videoClip = Util.getS3PreSignedUrl('Media/GiantSnakePuppetShow-H.264Podcasting.mp4');

    handlerInput.responseBuilder
      .speak(`here is ${stream.metadata.title}, as he did at Jean's 100th birthday party`)
      //.addVideoAppLaunchDirective('https://faproductions.uk/wp-content/uploads/2021/09/GiantSnakePuppetShow-H.264Podcasting.mp4');  // WORKS!
      .addVideoAppLaunchDirective(videoClip);  // WORKS!
      //.addAudioPlayerPlayDirective('REPLACE_ALL', stream.url, stream.token, 0, null, stream.metadata);
      // (PlayBehavior, url, token, offsetInMilliseconds, expectedPreviousToken, metadata)
      // PlayBehavior = REPLACE_ALL or ENQUEUE
      // url = trusted SSL AAC/MP$, MP3, HLS, PLS, M3U (16 to 384 kbps) [PLS and M3U used for radio streams]
      // offsetInMillseconds = time ins tream where playback should start
      // expectedPreviousToken (OPTIONAL) allowed only when ENQUEUE: to stop races between simult request for new track and change tracks
      // metadata (OPTIONAL) to display stuff on screen devices
    return handlerInput.responseBuilder
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'This skill plays an audio stream when it is started. It does not have any additional functionality.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const AboutIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AboutIntent';
  },
  handle(handlerInput) {
    const speechText = 'This is an audio streaming skill that was built with a free template from skill templates dot com';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (
        handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PauseIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.LoopOffIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ShuffleOffIntent'
      );
  },
  handle(handlerInput) {
    handlerInput.responseBuilder
      .addAudioPlayerClearQueueDirective('CLEAR_ALL')
      .addAudioPlayerStopDirective();

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const PlaybackStoppedIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'PlaybackController.PauseCommandIssued'
      || handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackStopped';
  },
  handle(handlerInput) {
    handlerInput.responseBuilder
      .addAudioPlayerClearQueueDirective('CLEAR_ALL')
      .addAudioPlayerStopDirective();

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const PlaybackStartedIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackStarted';
  },
  handle(handlerInput) {
    handlerInput.responseBuilder
      .addAudioPlayerClearQueueDirective('CLEAR_ENQUEUED');

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const ExceptionEncounteredRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'System.ExceptionEncountered';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return true;
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(handlerInput.requestEnvelope.request.type);
    return handlerInput.responseBuilder
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    PlayStreamIntentHandler,
    PlaybackStartedIntentHandler,
    CancelAndStopIntentHandler,
    PlaybackStoppedIntentHandler,
    AboutIntentHandler,
    HelpIntentHandler,
    ExceptionEncounteredRequestHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
