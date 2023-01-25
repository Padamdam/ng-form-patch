import {Inject, Injectable} from '@angular/core';
import {PatchServicesModule} from './patch-services.module';
import {FORM_PATCH_SERVICE, FormPatchService} from '../ng-form-patch.module';
import {BehaviorSubject, bufferTime, filter} from 'rxjs';

@Injectable({
    providedIn: PatchServicesModule
})
export class PatchService {

    public services: {
        [key: string]: BehaviorSubject<PatchServiceArgs | undefined>
    } = {}

    public constructor(@Inject(FORM_PATCH_SERVICE) private patchServices: FormPatchService[]) {
        this.patchServices.forEach(service => {
            let subject = new BehaviorSubject<PatchServiceArgs | undefined>(undefined);
            this.services[service.patchKey] = subject;
            subject
                .pipe(
                    filter(val => !!val),
                    bufferTime(500)
                )
                .subscribe(args => {
                    if (args !== undefined && args.length > 0) {
                        service.patch(args[0]!.params, args.map(arg => ({path: arg!.path, value: arg!.value})))
                            .subscribe();
                    }
                })
        })
    }

    public patch(patch: string, patchPath: string, params: { [key: string]: any; }, value: any): void {
        this.services[patch].next({
            params: params,
            path: patchPath,
            value: value
        });
    }
}

interface PatchServiceArgs {
    params: { [key: string]: any };
    path: string;
    value: any;
}