import { SphereMockInterface } from "./SphereMockInterface";
import { MirrorDatabase }      from "./MirrorDatabase";
import { BleMocks }            from "./BleMocks";
import { delay } from "./TestUtil";

type cloudId = string;

export class TestingAssistant {

  activeSphereId : string = null;
  spheres        : Record<cloudId, SphereMockInterface> = {}
  db             : MirrorDatabase;

  ble            : BleMocks;

  constructor() {
    this.db  = new MirrorDatabase();
    this.ble = new BleMocks();
  }


  async update() {
    await this._update();
    // retry getting the active sphere after a small delay
    if (this.activeSphereId === null) {
      await delay(2000);
      await this._update();
    }
  }


  async _update() {
    await this.db.update();
    this.spheres = {};
    for (let sphereId in this.db.spheres) {
      let sphere = this.db.spheres[sphereId];
      this.spheres[sphereId] = new SphereMockInterface(sphereId, sphere.data.data.uuid);
      await this.spheres[sphereId].loadSphereData();
      await this.spheres[sphereId].checkForActive();
      this.ble.loadSphereData(sphere);
    }
    await this._getActiveSphereId();
  }


  /**
   * Gets the cloud ID of the sphere
   * @param name
   */
  getSphereIdMostRecent() {
    let creationTime = 0;
    let candidate = null;
    for (let sphereId in this.db.spheres) {
      let createdAt = new Date(this.db.spheres[sphereId].data.data.createdAt).valueOf();
      if (createdAt > creationTime) {
        creationTime = createdAt;
        candidate = sphereId;
      }
    }
    return candidate;
  }


  /**
   * Gets the cloud ID of the sphere
   * @param name
   */
  async getActiveSphereLocalId() {
    if (!this.activeSphereId) {
      await this._getActiveSphereId();
    }

    if (this.activeSphereId) {
      if (!this.spheres[this.activeSphereId].sphereLocalId) {
        await this.spheres[this.activeSphereId].loadSphereData();
      }
      return this.spheres[this.activeSphereId].sphereLocalId || null;
    }

    return null;
  }


  async getRoomCount() {
    if (!this.activeSphereId) {
      await this._getActiveSphereId();
    }

    if (!this.activeSphereId) {
      return null;
    }

    let locationIds = Object.keys(this.db.spheres[this.activeSphereId].locations ?? {});
    return locationIds.length;
  }


  async getRoomId(roomIndex: number = 0) : Promise<string | null> {
    if (!this.activeSphereId) {
      await this._getActiveSphereId();
    }

    if (!this.activeSphereId) {
      return null;
    }

    let sphere = this.db.spheres[this.activeSphereId];
    let locationIds = Object.keys(sphere.locations);
    return locationIds[roomIndex];
  }


  async getRoomIdByName(name: string) : Promise<string | null> {
    if (!this.activeSphereId) {
      await this._getActiveSphereId();
    }

    if (!this.activeSphereId) {
      return null;
    }

    let locations = this.db.spheres[this.activeSphereId].locations;
    for (let locationId in locations) {
      if (locations[locationId].data.data.name === name) {
        return locationId;
      }
    }
    return null;
  }


  async doesRoomNameExists(name: string) : Promise<boolean> {
    if (!this.activeSphereId) {
      await this._getActiveSphereId();
    }

    if (!this.activeSphereId) {
      return false;
    }

    let locations = this.db.spheres[this.activeSphereId].locations;
    for (let locationId in locations) {
      if (locations[locationId].data.data.name === name) {
        return true;
      }
    }
    return false;
  }

  async getStoneId(stoneIndex: number = 0) : Promise<string | null> {
    if (!this.activeSphereId) {
      await this._getActiveSphereId();
    }

    if (!this.activeSphereId) {
      return null;
    }

    let sphere = this.db.spheres[this.activeSphereId];
    let stoneIds = Object.keys(sphere.stones);
    return stoneIds[stoneIndex];
  }

  async getStone(stoneIndex: number = 0) {
    let stoneId = await this.getStoneId(stoneIndex);
    if (stoneId === null) {
      return null;
    }

    return this.db[this.activeSphereId].stones[stoneId];
  }


  _getActiveSphereId() {
    this.activeSphereId = null;
    for (let sphereId in this.spheres) {
      if (this.spheres[sphereId].activeSphere) {
        this.activeSphereId = sphereId;
        return sphereId;
      }
    }
    return null;
  }
}
