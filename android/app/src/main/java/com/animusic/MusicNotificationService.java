package com.animusic;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import androidx.core.app.NotificationCompat;
import android.widget.RemoteViews;

public class MusicNotificationService extends Service {
    private static final String CHANNEL_ID = "MusicPlayerChannel";
    private static final int NOTIFICATION_ID = 1;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String action = intent.getAction();
        
        if (action != null) {
            switch (action) {
                case "PLAY":
                    // Handle play action
                    break;
                case "PAUSE":
                    // Handle pause action
                    break;
                case "NEXT":
                    // Handle next action
                    break;
                case "PREVIOUS":
                    // Handle previous action
                    break;
                case "STOP":
                    stopForeground(true);
                    stopSelf();
                    break;
            }
        }

        showNotification(
            intent.getStringExtra("title"),
            intent.getStringExtra("artist"),
            intent.getBooleanExtra("isPlaying", false)
        );

        return START_STICKY;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Music Player",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Music player controls");
            channel.setShowBadge(false);
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);
        }
    }

    private void showNotification(String title, String artist, boolean isPlaying) {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE
        );

        RemoteViews notificationLayout = new RemoteViews(getPackageName(), R.layout.notification_music);
        notificationLayout.setTextViewText(R.id.notification_title, title != null ? title : "Unknown Song");
        notificationLayout.setTextViewText(R.id.notification_artist, artist != null ? artist : "Unknown Artist");
        
        // Set play/pause button
        notificationLayout.setImageViewResource(
            R.id.notification_play_pause,
            isPlaying ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play
        );

        // Set click listeners
        Intent playIntent = new Intent(this, MusicNotificationService.class);
        playIntent.setAction(isPlaying ? "PAUSE" : "PLAY");
        PendingIntent playPendingIntent = PendingIntent.getService(
            this, 0, playIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        notificationLayout.setOnClickPendingIntent(R.id.notification_play_pause, playPendingIntent);

        Intent previousIntent = new Intent(this, MusicNotificationService.class);
        previousIntent.setAction("PREVIOUS");
        PendingIntent previousPendingIntent = PendingIntent.getService(
            this, 1, previousIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        notificationLayout.setOnClickPendingIntent(R.id.notification_previous, previousPendingIntent);

        Intent nextIntent = new Intent(this, MusicNotificationService.class);
        nextIntent.setAction("NEXT");
        PendingIntent nextPendingIntent = PendingIntent.getService(
            this, 2, nextIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        notificationLayout.setOnClickPendingIntent(R.id.notification_next, nextPendingIntent);

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(artist)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentIntent(pendingIntent)
            .setCustomContentView(notificationLayout)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .build();

        startForeground(NOTIFICATION_ID, notification);
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}