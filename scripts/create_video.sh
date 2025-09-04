#!/bin/bash
GENERATOR_LOCATION="./intro-outro-generator"

# This script takes two arguments: --video_file and --video_id

VIDEO_FILE=""
VIDEO_ID=""
SKIP_OUTRO=false

function help {
    echo "Usage: $0 --video_file <file> --video_id <id> [--generator_location <location>] [--skip-outro]"
    exit 1
}

while [[ $# -gt 0 ]]; do
    case $1 in
        --video_file)
            VIDEO_FILE="$2"
            shift 2
            ;;
        --video_id)
            VIDEO_ID="$2"
            shift 2
            ;;
        --generator_location)
            GENERATOR_LOCATION="$2"
            shift 2
            ;;
        --help)
            help
            ;;
        --skip-outro)
            SKIP_OUTRO=true
            shift
            ;;
        *)
            echo "Unknown argument: $1; use --help for usage information."
            exit 1
            ;;
    esac
done

# Check if the generator location is valid
# This is done by checking if it contains a make.py file and a r3talks folder
if [[ ! -f "$GENERATOR_LOCATION/make.py" || ! -d "$GENERATOR_LOCATION/r3talks" ]]; then
    echo "Invalid generator location: $GENERATOR_LOCATION"
    exit 1
fi

# Check if both arguments are provided
if [[ -z "$VIDEO_FILE" || -z "$VIDEO_ID" ]]; then
    echo "Both --video_file and --video_id must be provided."
    exit 1
fi

# Expand the VIDEO_FILE
VIDEO_FILE=$(realpath "$VIDEO_FILE")

# Check if the video file exists
if [[ ! -f "$VIDEO_FILE" ]]; then
    echo "Video file not found: $VIDEO_FILE"
    exit 1
fi


# Check if the video ID is going to a valid by checking if a file "$GENERATOR_LOCATION/r3talks/$VIDEO_ID.ts" exists
if [[ ! -f "$GENERATOR_LOCATION/r3talks/$VIDEO_ID.ts" ]]; then
    echo "Invalid video ID: $VIDEO_ID"
    exit 1
fi

# Check if output folder exists
if [[ ! -d "output" ]]; then
    mkdir "output"
fi

# Array of absolute paths
FILES=()

# First, add the video from the generator (intro)
FILES+=("$(realpath "$GENERATOR_LOCATION/r3talks/$VIDEO_ID.ts")")

# Then, add the video file provided by the user
FILES+=("$VIDEO_FILE")

# Then, optionally, add the outro video from the generator
if [[ "$SKIP_OUTRO" == false ]]; then
    FILES+=("$(realpath "$GENERATOR_LOCATION/r3talks/outro.ts")")
fi

# As these are different codecs, we need to re-encode them to a common codec
# ffmpeg -i input1.mp4 -i input2.webm -i input3.mov \
# -filter_complex "[0:v:0][0:a:0][1:v:0][1:a:0][2:v:0][2:a:0]concat=n=3:v=1:a=1[outv][outa]" \
# -map "[outv]" -map "[outa]" output.mkv

FFMPEG_INPUTS=""

for FILE in "${FILES[@]}"; do
    FFMPEG_INPUTS+="-i $FILE "
done

NUM_FILES=${#FILES[@]}

FFMPEG_FILTER="-filter_complex "

for (( i=0; i<NUM_FILES; i++ )); do
    FFMPEG_FILTER+="[$i:v:0][$i:a:0]"
done

set -x

ffmpeg -hide_banner -y $FFMPEG_INPUTS ${FFMPEG_FILTER}concat=n=$NUM_FILES:v=1:a=1[outv][outa] -map "[outv]" -map "[outa]" output/${VIDEO_ID}_final.mkv

set +x