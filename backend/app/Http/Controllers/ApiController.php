<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ApiController extends Controller
{
    public function build(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required',
            'sketch' => 'required|string'
        ]);
        $code = $validated['code'];
        $sketchName = $validated['sketch'];

        // Specify the path to the file
        $filePath = storage_path("app/sketch/{$sketchName}.ino");
        $scriptPath = base_path('build.sh');

        Storage::put("sketch/{$sketchName}.ino", $code);

        //TODO MOVE IT TO DOCKEFILE
        exec("/usr/local/bin/arduino-cli core install arduino:avr");
        exec("bash $scriptPath $sketchName 2>&1", $output, $returnCode);

        // Save the content to the file
        return response()->json([
            'output' => $output,
            'code' => $returnCode,
            'hex' => $returnCode == 0 ? Storage::get("sketch/build/{$sketchName}/{$sketchName}.ino.hex") : null
        ]);
    }
}
