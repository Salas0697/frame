/* One owner for the native picker and the complete import transaction.
 * Dependencies are injected so ordering and File identity can be regression tested.
 */
class PhotoImportController {
  constructor(ports) {
    this.ports = ports;
    this.pendingFiles = [];
    this.active = false;
    this.phase = 'idle';
    this.onChange = event => {
      // Copy File references before clearing the input. Never read a live FileList later.
      const files = Array.from(event.currentTarget.files || []);
      event.currentTarget.value = '';
      void this.filesSelected(files);
    };
    this.onCancel = () => { if (!this.active) this.transition('idle'); };
    ports.input.addEventListener('change', this.onChange);
    ports.input.addEventListener('cancel', this.onCancel);
    ports.input.disabled = false;
  }

  transition(phase) {
    this.phase = phase;
    this.ports.onPhase?.(phase, this.pendingFiles.length);
  }

  selectPhotos() {
    if (this.active || this.ports.isBlocked?.()) return;
    const input = this.ports.input;
    input.value = '';
    this.transition('selecting');
    // Stay in the original user gesture; no timer, promise or animation frame here.
    input.click();
  }

  async filesSelected(selection) {
    if (this.active || this.ports.isBlocked?.()) return false;
    const files = Array.from(selection);
    if (!files.length) { this.transition('idle'); return false; }
    this.active = true;
    this.pendingFiles = files;
    let photos = [];
    let checkpoint;
    try {
      this.ports.setBusy(true);
      this.transition('brief');
      // requestBrief mounts/shows synchronously, before this first await.
      const brief = await this.ports.requestBrief(files);
      if (!brief) return false;
      this.transition('analysis');
      this.ports.showProgress('Analizando tus fotos…');
      await this.ports.yieldToPaint();
      photos = await this.ports.analyzePhotos(files, message => this.ports.showProgress(message), brief);
      if (photos.length !== files.length) throw new Error('Incomplete photo analysis');
      checkpoint = this.ports.checkpoint();
      this.transition('commit');
      this.ports.commitPhotos(photos, brief);
      this.transition('storyboard');
      this.ports.showProgress('Generando storyboard…');
      await this.ports.yieldToPaint();
      this.ports.generateStoryboard();
      this.transition('render');
      this.ports.render();
      // Files are paired with analysis results by index, never with mutable S.photos.
      await this.ports.persistPhotos(files, photos);
      this.ports.onSuccess(photos.length);
      this.transition('complete');
      return true;
    } catch (error) {
      if (checkpoint !== undefined) this.ports.rollback(checkpoint);
      this.ports.releasePhotos(photos);
      this.transition('error');
      this.ports.onError(error);
      return false;
    } finally {
      this.pendingFiles = [];
      this.active = false;
      this.ports.hideProgress();
      this.ports.setBusy(false);
      this.transition('idle');
    }
  }
}

if (typeof module !== 'undefined' && module.exports) module.exports = PhotoImportController;
