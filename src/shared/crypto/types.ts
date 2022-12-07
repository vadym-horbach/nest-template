import type { CipherCCMTypes, CipherGCMTypes, CipherOCBTypes } from 'crypto'

export type T_Algorithm = CipherCCMTypes | CipherGCMTypes | CipherOCBTypes | string
