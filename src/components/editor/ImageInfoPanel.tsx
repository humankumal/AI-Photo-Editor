import { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { getInfoAsync } from 'expo-file-system/legacy';
import type { AssetInfo } from 'expo-media-library';

type Props = {
  visible: boolean;
  onClose: () => void;
  workingUri: string | null;
  assetInfo: AssetInfo | null;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImageInfoPanel({ visible, onClose, workingUri, assetInfo }: Props) {
  const [fileSize, setFileSize] = useState<number | null>(null);

  useEffect(() => {
    if (!workingUri || !visible) return;
    (async () => {
      try {
        const info = await getInfoAsync(workingUri);
        if (info.exists && !info.isDirectory) {
          setFileSize(info.size);
        }
      } catch {}
    })();
  }, [workingUri, visible]);

  const exif = assetInfo?.exif as Record<string, unknown> | undefined;

  const rows: { label: string; value: string }[] = [
    assetInfo
      ? { label: 'Dimensions', value: `${assetInfo.width} × ${assetInfo.height} px` }
      : null,
    fileSize != null ? { label: 'File Size', value: formatBytes(fileSize) } : null,
    assetInfo?.creationTime
      ? {
          label: 'Date',
          value: new Date(assetInfo.creationTime).toLocaleDateString(undefined, {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }),
        }
      : null,
    exif?.Make
      ? { label: 'Camera', value: `${exif.Make} ${exif?.Model ?? ''}`.trim() }
      : null,
    exif?.ISOSpeedRatings
      ? { label: 'ISO', value: String(exif.ISOSpeedRatings) }
      : null,
    exif?.FNumber
      ? { label: 'Aperture', value: `f/${exif.FNumber}` }
      : null,
    exif?.ExposureTime
      ? { label: 'Shutter', value: `1/${Math.round(1 / Number(exif.ExposureTime))}s` }
      : null,
    exif?.GPSLatitude
      ? {
          label: 'Location',
          value: `${Number(exif.GPSLatitude).toFixed(4)}, ${Number(exif?.GPSLongitude ?? 0).toFixed(4)}`,
        }
      : null,
  ].filter((r): r is { label: string; value: string } => r !== null);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}
      >
        <View style={{ backgroundColor: '#1a1a1a', borderRadius: 20, padding: 24, maxHeight: '70%' }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', marginBottom: 16 }}>
            Photo Info
          </Text>
          <ScrollView>
            {rows.map(({ label, value }) => (
              <View
                key={label}
                style={{
                  flexDirection: 'row',
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: '#2a2a2a',
                }}
              >
                <Text style={{ color: '#888', width: 90, fontSize: 14 }}>{label}</Text>
                <Text style={{ color: '#e5e5e5', flex: 1, fontSize: 14 }}>{value}</Text>
              </View>
            ))}
            {rows.length === 0 && (
              <Text style={{ color: '#555', textAlign: 'center', paddingVertical: 20 }}>
                No metadata available.
              </Text>
            )}
          </ScrollView>
          <TouchableOpacity
            onPress={onClose}
            style={{
              marginTop: 20,
              backgroundColor: '#2a2a2a',
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#aaa', fontWeight: '600' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
