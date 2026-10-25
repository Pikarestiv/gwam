<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\Validator;

class Controller extends BaseController
{
  use AuthorizesRequests, ValidatesRequests;

  protected function ok(string $message, $data = [], int $status = 200): JsonResponse
  {
    return response()->json(['success' => true, 'message' => $message, 'data' => $data], $status);
  }

  protected function fail(string $message, int $status, array $extra = []): JsonResponse
  {
    return response()->json(['success' => false, 'message' => $message] + $extra, $status);
  }

  /** Returns the validated array, or a 422 JsonResponse the caller must return. */
  protected function check(array $input, array $rules): array|JsonResponse
  {
    $validator = Validator::make($input, $rules);

    return $validator->fails()
      ? $this->fail('Validation failed.', 422, ['errors' => $validator->errors()])
      : $validator->validated();
  }
}
