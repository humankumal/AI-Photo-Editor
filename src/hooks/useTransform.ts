import { useState } from 'react';
import * as ImageManipulator from 'expo-image-manipulator';
import { useEditorStore } from '@/store/editorSlice';

export function useTransform() {
  const [isApplying, setIsApplying] = useState(false);
  const { workingUri, originalUri, commitTransform } = useEditorStore();

  async function rotateCW() {
    const uri = workingUri ?? originalUri;
    if (!uri) return;
    setIsApplying(true);
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ rotate: 90 }],
        { compress: 0.95, format: ImageManipulator.SaveFormat.JPEG }
      );
      commitTransform(result.uri);
    } catch (e) {
      console.warn('Rotate CW failed:', e);
    } finally {
      setIsApplying(false);
    }
  }

  async function rotateCCW() {
    const uri = workingUri ?? originalUri;
    if (!uri) return;
    setIsApplying(true);
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ rotate: -90 }],
        { compress: 0.95, format: ImageManipulator.SaveFormat.JPEG }
      );
      commitTransform(result.uri);
    } catch (e) {
      console.warn('Rotate CCW failed:', e);
    } finally {
      setIsApplying(false);
    }
  }

  async function flipH() {
    const uri = workingUri ?? originalUri;
    if (!uri) return;
    setIsApplying(true);
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ flip: ImageManipulator.FlipType.Horizontal }],
        { compress: 0.95, format: ImageManipulator.SaveFormat.JPEG }
      );
      commitTransform(result.uri);
    } catch (e) {
      console.warn('Flip H failed:', e);
    } finally {
      setIsApplying(false);
    }
  }

  async function flipV() {
    const uri = workingUri ?? originalUri;
    if (!uri) return;
    setIsApplying(true);
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ flip: ImageManipulator.FlipType.Vertical }],
        { compress: 0.95, format: ImageManipulator.SaveFormat.JPEG }
      );
      commitTransform(result.uri);
    } catch (e) {
      console.warn('Flip V failed:', e);
    } finally {
      setIsApplying(false);
    }
  }

  async function applyFreeRotate(deg: number) {
    const uri = workingUri ?? originalUri;
    if (!uri || Math.abs(deg) < 0.1) return;
    setIsApplying(true);
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ rotate: deg }],
        { compress: 0.95, format: ImageManipulator.SaveFormat.JPEG }
      );
      commitTransform(result.uri);
    } catch (e) {
      console.warn('Free rotate failed:', e);
    } finally {
      setIsApplying(false);
    }
  }

  return { isApplying, rotateCW, rotateCCW, flipH, flipV, applyFreeRotate };
}
