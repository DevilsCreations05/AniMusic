package com.animusic;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.Context;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.io.IOException;
import java.io.OutputStream;
import java.util.Set;
import java.util.UUID;
import java.nio.charset.StandardCharsets;

public class HoneywellPrinterModule extends ReactContextBaseJavaModule {
    private static final String TAG = "HoneywellPrinter";
    private static final UUID PRINTER_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB"); // Standard Serial Port UUID
    
    private BluetoothAdapter bluetoothAdapter;
    private BluetoothDevice connectedDevice;
    private OutputStream outputStream;
    
    public HoneywellPrinterModule(ReactApplicationContext reactContext) {
        super(reactContext);
        bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
    }

    @Override
    public String getName() {
        return "HoneywellPrinter";
    }

    @ReactMethod
    public void discoverPrinters(Promise promise) {
        try {
            if (bluetoothAdapter == null) {
                promise.reject("BLUETOOTH_NOT_AVAILABLE", "Bluetooth not available on this device");
                return;
            }

            if (!bluetoothAdapter.isEnabled()) {
                promise.reject("BLUETOOTH_DISABLED", "Bluetooth is disabled");
                return;
            }

            WritableArray printers = Arguments.createArray();
            Set<BluetoothDevice> pairedDevices = bluetoothAdapter.getBondedDevices();
            
            for (BluetoothDevice device : pairedDevices) {
                String deviceName = device.getName();
                if (deviceName != null && (
                    deviceName.toLowerCase().contains("honeywell") ||
                    deviceName.toLowerCase().contains("6824") ||
                    deviceName.toLowerCase().contains("pc42") ||
                    deviceName.toLowerCase().contains("printer")
                )) {
                    WritableMap printer = Arguments.createMap();
                    printer.putString("id", device.getAddress());
                    printer.putString("name", deviceName);
                    printer.putString("address", device.getAddress());
                    printer.putString("model", deviceName);
                    printer.putBoolean("isConnected", false);
                    printers.pushMap(printer);
                }
            }
            
            promise.resolve(printers);
            
        } catch (SecurityException e) {
            promise.reject("PERMISSION_DENIED", "Bluetooth permission denied: " + e.getMessage());
        } catch (Exception e) {
            promise.reject("DISCOVERY_FAILED", "Failed to discover printers: " + e.getMessage());
        }
    }

    @ReactMethod
    public void connectToPrinter(String deviceAddress, Promise promise) {
        try {
            if (bluetoothAdapter == null) {
                promise.reject("BLUETOOTH_NOT_AVAILABLE", "Bluetooth not available");
                return;
            }

            BluetoothDevice device = bluetoothAdapter.getRemoteDevice(deviceAddress);
            if (device == null) {
                promise.reject("DEVICE_NOT_FOUND", "Device not found");
                return;
            }

            // Close existing connection
            disconnect();

            // Create Bluetooth socket
            try {
                var socket = device.createRfcommSocketToServiceRecord(PRINTER_UUID);
                socket.connect();
                outputStream = socket.getOutputStream();
                connectedDevice = device;
                
                Log.d(TAG, "Connected to printer: " + device.getName());
                promise.resolve(true);
                
            } catch (IOException e) {
                Log.e(TAG, "Failed to connect to printer", e);
                promise.reject("CONNECTION_FAILED", "Failed to connect: " + e.getMessage());
            }
            
        } catch (SecurityException e) {
            promise.reject("PERMISSION_DENIED", "Bluetooth permission denied: " + e.getMessage());
        } catch (Exception e) {
            promise.reject("CONNECTION_ERROR", "Connection error: " + e.getMessage());
        }
    }

    @ReactMethod
    public void disconnect(Promise promise) {
        try {
            disconnect();
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("DISCONNECT_ERROR", "Disconnect failed: " + e.getMessage());
        }
    }

    private void disconnect() {
        try {
            if (outputStream != null) {
                outputStream.close();
                outputStream = null;
            }
            connectedDevice = null;
        } catch (IOException e) {
            Log.e(TAG, "Error closing connection", e);
        }
    }

    @ReactMethod
    public void printText(String text, ReadableMap options, Promise promise) {
        if (outputStream == null) {
            promise.reject("NOT_CONNECTED", "Printer not connected");
            return;
        }

        try {
            // Send ESC/P commands for dot matrix printer
            // ESC @ - Initialize printer
            outputStream.write(new byte[]{0x1B, 0x40});
            
            // Print the text
            byte[] textBytes = text.getBytes(StandardCharsets.UTF_8);
            outputStream.write(textBytes);
            
            // Form feed to eject paper
            outputStream.write(0x0C);
            
            outputStream.flush();
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            promise.resolve(result);
            
        } catch (IOException e) {
            Log.e(TAG, "Print failed", e);
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", false);
            result.putString("error", e.getMessage());
            promise.reject("PRINT_FAILED", "Print failed: " + e.getMessage());
        }
    }

    @ReactMethod
    public void sendRawData(ReadableArray commandsArray, Promise promise) {
        if (outputStream == null) {
            promise.reject("NOT_CONNECTED", "Printer not connected");
            return;
        }

        try {
            byte[] commands = new byte[commandsArray.size()];
            for (int i = 0; i < commandsArray.size(); i++) {
                commands[i] = (byte) commandsArray.getInt(i);
            }
            
            outputStream.write(commands);
            outputStream.flush();
            
            promise.resolve(true);
            
        } catch (IOException e) {
            Log.e(TAG, "Failed to send raw data", e);
            promise.reject("SEND_FAILED", "Failed to send raw data: " + e.getMessage());
        }
    }

    @ReactMethod
    public void getStatus(Promise promise) {
        try {
            WritableMap status = Arguments.createMap();
            status.putBoolean("online", connectedDevice != null);
            status.putString("paperLevel", "normal"); // Would need specific printer commands to check
            
            WritableArray errors = Arguments.createArray();
            if (connectedDevice == null) {
                errors.pushString("Not connected");
            }
            status.putArray("errors", errors);
            
            promise.resolve(status);
            
        } catch (Exception e) {
            promise.reject("STATUS_ERROR", "Failed to get status: " + e.getMessage());
        }
    }
}