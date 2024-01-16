    function MyComponent_div_2_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵi18nStart(0, 0, 1);
        i0.ɵɵelementStart(1, "div");
        i0.ɵɵelement(2, "p", 2);
        i0.ɵɵelementEnd();
        i0.ɵɵi18nEnd();
    } if (rf & 2) {
        const diskView_r1 = ctx.$implicit;
        i0.ɵɵadvance(2);
        i0.ɵɵi18nExp(diskView_r1.disk == null ? null : diskView_r1.disk.metadata == null ? null : diskView_r1.disk.metadata.name)(diskView_r1.disk == null ? null : diskView_r1.disk.status == null ? null : diskView_r1.disk.status.virtualMachineAttachments == null ? null : diskView_r1.disk.status.virtualMachineAttachments.length);
        i0.ɵɵi18nApply(0);
    } }
    …
    decls: 3, vars: 1, consts: () => { let i18n_1; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
            /**
             * @suppress {msgDescriptions}
             */
            const MSG_EXTERNAL_5731037447622183595$$Q_TS__2 = goog.getMsg("{VAR_PLURAL, plural, =1 {VM} other {VMs}}");
            i18n_1 = MSG_EXTERNAL_5731037447622183595$$Q_TS__2;
        }
        else {
            i18n_1 = $localize `{VAR_PLURAL, plural, =1 {VM} other {VMs}}`;
        } i18n_1 = i0.ɵɵi18nPostprocess(i18n_1, { "VAR_PLURAL": "\uFFFD1:1\uFFFD" }); let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
            /**
             * @suppress {msgDescriptions}
             */
            const MSG_EXTERNAL_8958166834498365097$$Q_TS__3 = goog.getMsg("{$startTagDiv}{$startParagraph} Disk \"{$interpolation}\" needs to be detached from the below {$icu} to be deleted. {$closeParagraph}{$closeTagDiv}", { "closeParagraph": "\uFFFD/#2:1\uFFFD", "closeTagDiv": "\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD", "icu": i18n_1, "interpolation": "\uFFFD0:1\uFFFD", "startParagraph": "\uFFFD#2:1\uFFFD", "startTagDiv": "\uFFFD*2:1\uFFFD\uFFFD#1:1\uFFFD" }, { original_code: { "closeParagraph": "</p>", "closeTagDiv": "</div>", "icu": "{diskView.disk?.status?.virtualMachineAttachments?.length, plural, =1 {VM} other {VMs}}", "interpolation": "{{ diskView.disk?.metadata?.name }}", "startParagraph": "<p class=\"cfc-space-below-minus-5\">", "startTagDiv": "<div *ngFor=\"let diskView of attachedDiskViews\">" } });
            i18n_0 = MSG_EXTERNAL_8958166834498365097$$Q_TS__3;
        }
        else {
            i18n_0 = $localize `${"\uFFFD*2:1\uFFFD\uFFFD#1:1\uFFFD"}:START_TAG_DIV:${"\uFFFD#2:1\uFFFD"}:START_PARAGRAPH: Disk "${"\uFFFD0:1\uFFFD"}:INTERPOLATION:" needs to be detached from the below ${i18n_1}:ICU@@6698398538955432050: to be deleted. ${"\uFFFD/#2:1\uFFFD"}:CLOSE_PARAGRAPH:${"\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD"}:CLOSE_TAG_DIV:`;
        } return [i18n_0, [4, "ngFor", "ngForOf"], [1, "cfc-space-below-minus-5"]]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div");
            i0.ɵɵi18nStart(1, 0);
            i0.ɵɵtemplate(2, MyComponent_div_2_Template, 3, 2, "div", 1);
            i0.ɵɵi18nEnd();
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngForOf", ctx.attachedDiskViews);
        } }
