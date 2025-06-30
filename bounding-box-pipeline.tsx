//bounding-box-pipeline.tsx
import React, { useCallback } from 'react';
import type { RefObject } from 'react';
import { GoogleGenAI } from '@google/genai';
import getStroke from 'perfect-freehand';
import { getSvgPathFromStroke, loadImage } from './utils';
import { BoundingBox2DType } from './Types';

// Types for hook arguments
interface UseBoundingBoxPipelineArgs {
  apiKey: string;
  temperature: number;
  targetPrompt: string;
  labelPrompt: string;
  lines: any[];
  imageSrc: string | null;
  videoRef: RefObject<HTMLVideoElement>;
  stream: boolean;
  setBoundingBoxes2D: (boxes: BoundingBox2DType[]) => void;
  setIsLoading: (loading: boolean) => void;
  setHoverEntered: (entered: boolean) => void;
}

// --- Hook: useBoundingBoxPipeline ---
export function useBoundingBoxPipeline({
  apiKey,
  temperature,
  targetPrompt,
  labelPrompt,
  lines,
  imageSrc,
  videoRef,
  stream,
  setBoundingBoxes2D,
  setIsLoading,
  setHoverEntered,
}: UseBoundingBoxPipelineArgs) {
  const ai = new GoogleGenAI({ apiKey });

  // Prompt builder
  const get2dPrompt = useCallback(() =>
    `Detect Math, with no more than 20 items. Output a json list where each entry contains the 2D bounding box in "box_2d" and ${labelPrompt || 'a text label'} in "label".`,
    [targetPrompt, labelPrompt]
  );

  // Main pipeline function
  const runBoundingBoxPipeline = useCallback(async () => {
    setIsLoading(true);
    try {
      let activeDataURL;
      const maxSize = 640;
      const copyCanvas = document.createElement('canvas');
      const ctx = copyCanvas.getContext('2d')!;

      if (stream) {
        // screenshare
        const video = videoRef.current!;
        const scale = Math.min(
          maxSize / video.videoWidth,
          maxSize / video.videoHeight,
        );
        copyCanvas.width = video.videoWidth * scale;
        copyCanvas.height = video.videoHeight * scale;
        ctx.drawImage(
          video,
          0,
          0,
          video.videoWidth * scale,
          video.videoHeight * scale,
        );
      } else if (imageSrc) {
        const image = await loadImage(imageSrc);
        const scale = Math.min(maxSize / image.width, maxSize / image.height);
        copyCanvas.width = image.width * scale;
        copyCanvas.height = image.height * scale;
        ctx.drawImage(image, 0, 0, image.width * scale, image.height * scale);
      }
      activeDataURL = copyCanvas.toDataURL('image/png');

      if (lines.length > 0) {
        for (const line of lines) {
          const p = new Path2D(
            getSvgPathFromStroke(
              getStroke(
                line[0].map(([x, y]: [number, number]) => [
                  x * copyCanvas.width,
                  y * copyCanvas.height,
                  0.5,
                ]),
                // @ts-ignore
                line[2] || {},
              ),
            ),
          );
          ctx.fillStyle = line[1];
          ctx.fill(p);
        }
        activeDataURL = copyCanvas.toDataURL('image/png');
      }

      setHoverEntered(false);
      const config: {
        temperature: number;
      } = {
        temperature,
      };
      const model = 'models/gemini-2.5-flash';

      let response = (
        await ai.models.generateContent({
          model,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    data: activeDataURL.replace('data:image/png;base64,', ''),
                    mimeType: 'image/png',
                  },
                },
                { text: get2dPrompt() },
              ],
            },
          ],
          config,
        })
      ).text;

      if (response.includes('```json')) {
        response = response.split('```json')[1].split('```')[0];
      }
      const parsedResponse = JSON.parse(response);
      const formattedBoxes: BoundingBox2DType[] = parsedResponse.map(
        (box: { box_2d: [number, number, number, number]; label: string }) => {
          const [ymin, xmin, ymax, xmax] = box.box_2d;
          return {
            x: xmin / 1000,
            y: ymin / 1000,
            width: (xmax - xmin) / 1000,
            height: (ymax - ymin) / 1000,
            label: box.label,
          };
        },
      );
      setHoverEntered(false);
      setBoundingBoxes2D(formattedBoxes);
    } finally {
      setIsLoading(false);
    }
  }, [ai, temperature, targetPrompt, labelPrompt, lines, imageSrc, videoRef, stream, setBoundingBoxes2D, setIsLoading, setHoverEntered, get2dPrompt]);

  return { runBoundingBoxPipeline, get2dPrompt };
}

// --- Component: BoundingBoxOverlay ---
interface BoundingBoxOverlayProps {
  boundingBoxes2D: BoundingBox2DType[];
  containerDims: { width: number; height: number };
}

export function BoundingBoxOverlay({ boundingBoxes2D, containerDims }: BoundingBoxOverlayProps) {
  return (
    <>
      {boundingBoxes2D.map((box, i) => (
        <div
          key={i}
          className="absolute bbox border-2 border-[#3B68FF]"
          style={{
            transformOrigin: '0 0',
            top: box.y * 100 + '%',
            left: box.x * 100 + '%',
            width: box.width * 100 + '%',
            height: box.height * 100 + '%',
          }}
        >
          <div className="bg-[#3B68FF] text-white absolute left-0 top-0 text-sm px-1">
            {box.label}
          </div>
        </div>
      ))}
    </>
  );
} 